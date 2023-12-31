import { Suspense } from "react";
import Loading from "./loading";
import { Converter } from "./converter";
import { getLatestPrice } from "./api/price/route";
import { cookies } from "next/headers";
import { Currency } from "./types";
import { SkeletonTheme } from "react-loading-skeleton";

export default async function Home() {
  const [currency, fiatAmount]: [Currency, number] = (() => {
    try {
      const fiatAmount = parseFloat(
        (cookies().get("fiatAmount") || { value: "1.0" }).value
      );

      return [
        (cookies().get("currency") || { value: "USD" }).value as Currency,
        isNaN(fiatAmount) ? 1 : fiatAmount,
      ];
    } catch (e) {
      return ["USD", 1.0];
    }
  })();

  const wucValue = await getLatestPrice(currency);

  return (
    <Suspense fallback={<Loading />}>
      <Converter fiatAmount={fiatAmount} wucValue={wucValue} />
    </Suspense>
  );
}
