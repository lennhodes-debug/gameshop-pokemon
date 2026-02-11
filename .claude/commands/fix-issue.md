Fix een GitHub issue:

1. Lees het issue met `gh issue view $ARGUMENTS`
2. Gebruik de researcher subagent om de relevante code te vinden
3. Maak een fix branch: `git checkout -b fix/$ARGUMENTS`
4. Implementeer de fix
5. Run `npm run build` om te valideren
6. Commit en push
7. Maak een PR

Issue nummer: $ARGUMENTS