import { ApiResponse, Currency, WucValueResponse, WucValue } from "@/app/types";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function getLatestPrice(currency?: Currency): Promise<WucValue> {
  let code = currency;
  if (!code) {
    const cookie = cookies();
    code = cookie.get("currency")
      ? (cookie.get("currency")?.value as Currency)
      : "USD";
  }

  const res = await fetch(`https://api.frontendeval.com/fake/crypto/${code}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  const json = await res.json();

  return { value: (json as unknown as ApiResponse).value, currency: code };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paramsCurrency = searchParams.get("currency") as Currency;

  try {
    const data = await getLatestPrice(paramsCurrency);

    return NextResponse.json<WucValueResponse>(
      { data },
      {
        status: 200,
      }
    );
  } catch (e) {
    return NextResponse.json<WucValueResponse>(
      { data: null, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
