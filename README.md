# Crypto Converter

Solution to [Crypto Converter](https://frontendeval.com/questions/crypto-converter)

This was built with NextJS as I wanted to test out [streaming UI components](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming) using SSR and React's Suspense component. The app persists the last chosen fiat amount and currency to display and pre-fetches the latest price before rendering the page. A Route Handler is responsible for fetching the price information, both in this stage and on the client side, using polling to update the result every ten seconds.

The previous price for each currency is stored allowing the app to display the percentage change since the last result, while debouncing is applied to the text input to ensure it is not fetched too frequently. I would have liked to incorporate Server Actions in some capacity now that they are stable but there are no mutations to perform with this problem, other than persisting the amount and currency.

In a real application like this, a WebSocket connection would probably make more sense over polling - the server would poll the remote endpoint and then push updates to each connected client. NextJS and Vercel do not currently accommodate WebSocket apps except by using third party services.

To save time, I used the [react-currency-input-field](https://www.npmjs.com/package/react-currency-input-field) npm package for the currency text input, as it is very complicated to implement formatting while typing. The interface is styled with TailwindCSS and Framer Motion.

## Develop

```bash
yarn
yarn dev
```
