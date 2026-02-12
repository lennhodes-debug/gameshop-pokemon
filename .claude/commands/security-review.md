Security review uitvoeren:

## Stappen

1. **Scope** — Gebruik de `security-auditor` subagent voor de audit
   - Target: $ARGUMENTS (of hele applicatie als niets opgegeven)

2. **Audit** op:
   - XSS preventie in React componenten
   - Input sanitization in zoek/filter (`src/app/shop/page.tsx`)
   - Veilige localStorage (cart data validatie)
   - Checkout formulier validatie (`src/app/afrekenen/page.tsx`)
   - Geen exposed secrets of credentials
   - GDPR compliance (privacy beleid)
   - `npm audit` voor dependencies

3. **Rapporteer** met OWASP referenties en concrete fix-suggesties

4. **Fix** CRITICAL findings direct, commit + push

Focus: $ARGUMENTS
