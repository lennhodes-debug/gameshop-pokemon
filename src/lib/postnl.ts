const POSTNL_API_URL = 'https://api.postnl.nl';
const POSTNL_SANDBOX_URL = 'https://api-sandbox.postnl.nl';

interface PostNLAddress {
  name: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  countryCode: string;
}

interface ShipmentResult {
  trackingCode: string;
  trackingUrl: string;
  labelPdf: string; // Base64 encoded PDF
}

function getBaseUrl(): string {
  return process.env.POSTNL_SANDBOX === 'true' ? POSTNL_SANDBOX_URL : POSTNL_API_URL;
}

function getHeaders(): Record<string, string> {
  return {
    'apikey': process.env.POSTNL_API_KEY || '',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

export async function createShipment(
  recipient: PostNLAddress,
  orderNumber: string,
  weight: number = 500, // gram
): Promise<ShipmentResult> {
  const apiKey = process.env.POSTNL_API_KEY;
  if (!apiKey) {
    throw new Error('POSTNL_API_KEY niet ingesteld');
  }

  const customerNumber = process.env.POSTNL_CUSTOMER_NUMBER || '';
  const customerCode = process.env.POSTNL_CUSTOMER_CODE || '';
  const collectionLocation = process.env.POSTNL_COLLECTION_LOCATION || '';

  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}/v1/shipment`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      Customer: {
        CustomerNumber: customerNumber,
        CustomerCode: customerCode,
        CollectionLocation: collectionLocation,
        Address: {
          AddressType: '02', // Afzender
          CompanyName: 'Gameshop Enter',
          Street: process.env.POSTNL_SENDER_STREET || '',
          HouseNr: process.env.POSTNL_SENDER_HOUSENR || '',
          Zipcode: process.env.POSTNL_SENDER_ZIPCODE || '',
          City: process.env.POSTNL_SENDER_CITY || '',
          Countrycode: 'NL',
        },
      },
      Message: {
        MessageID: orderNumber,
        MessageTimeStamp: new Date().toISOString(),
        Printertype: 'GraphicFile|PDF',
      },
      Shipments: [
        {
          Addresses: [
            {
              AddressType: '01', // Ontvanger
              FirstName: recipient.name.split(' ')[0],
              Name: recipient.name.split(' ').slice(1).join(' ') || recipient.name,
              Street: recipient.street,
              HouseNr: recipient.houseNumber,
              Zipcode: recipient.postalCode,
              City: recipient.city,
              Countrycode: recipient.countryCode,
            },
          ],
          ProductCodeDelivery: '3085', // Standaard pakket
          Dimension: {
            Weight: weight,
          },
          Reference: orderNumber,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('PostNL API error:', errorText);
    throw new Error(`PostNL API fout: ${response.status}`);
  }

  const result = await response.json();
  const shipment = result.ResponseShipments?.[0];

  if (!shipment) {
    throw new Error('Geen zending ontvangen van PostNL');
  }

  const trackingCode = shipment.Barcode || '';
  const labelPdf = shipment.Labels?.[0]?.Content || '';

  return {
    trackingCode,
    trackingUrl: `https://postnl.nl/tracktrace/?B=${trackingCode}&P=${recipient.postalCode}&D=NL&T=C`,
    labelPdf,
  };
}

export async function getTrackingStatus(trackingCode: string, postalCode: string): Promise<{
  status: string;
  timestamp: string;
  description: string;
}> {
  const apiKey = process.env.POSTNL_API_KEY;
  if (!apiKey) {
    throw new Error('POSTNL_API_KEY niet ingesteld');
  }

  const baseUrl = getBaseUrl();

  const response = await fetch(
    `${baseUrl}/v1/shipment?trackingcode=${trackingCode}&postalcode=${postalCode}`,
    { headers: getHeaders() }
  );

  if (!response.ok) {
    throw new Error(`PostNL tracking fout: ${response.status}`);
  }

  const result = await response.json();
  const status = result.CompleteStatus?.Shipment?.[0]?.Status;

  return {
    status: status?.StatusCode || 'unknown',
    timestamp: status?.TimeStamp || '',
    description: status?.StatusDescription || 'Status onbekend',
  };
}
