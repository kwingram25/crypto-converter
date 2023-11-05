"use client";

import { ArrowLeftRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import colors from "tailwindcss/colors";
import { useCookies } from "react-cookie";
import { motion } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import {
  CURRENCIES,
  Currency,
  WucValueResponse,
  SYMBOLS,
  WucValue,
} from "./types";
import CurrencyInput from "react-currency-input-field";
import { useDebounce } from "./useDebounce";
import { classes } from "./lib";
import spinner from "../public/spinner.svg";
import Image from "next/image";

const ANIMATE = {
  neutral: {
    backgroundColor: colors.neutral[800],
  },
  down: {
    backgroundColor: colors.red[800],
  },
  up: {
    backgroundColor: colors.green[800],
  },
};

function formatWuc(value: number): string {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: value >= 100 ? 2 : 4,
    minimumFractionDigits: 0,
  });
}

export function Converter({
  isLoading,
  ...props
}: {
  isLoading?: boolean;
  fiatAmount?: number;
  wucValue?: WucValue;
}) {
  const [, setCookie] = useCookies<"fiatAmount", { fiatAmount?: number }>([
    "fiatAmount",
  ]);
  const isMounted = useRef(false);
  const interval = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [wucValue, setWucValue] = useState<WucValue | undefined>(
    props.wucValue
  );
  const [fiatAmount, setFiatAmount] = useState<string>(
    `${props.fiatAmount}` || "1.0"
  );
  const dbFiatAmount = useDebounce(fiatAmount);
  const [currency, setCurrency] = useState<Currency>(
    props.wucValue?.currency || "USD"
  );
  const [isTotalLoading, setIsTotalLoading] = useState(isLoading);

  const wucValuePrev = useRef<WucValue | undefined>(wucValue);

  const [wucTotal, isDown, diffDisplay] = useMemo(() => {
    if (isLoading || !wucValue) {
      return [0, false, null];
    }

    const isZero = dbFiatAmount === "0" || dbFiatAmount.length === 0;
    const amt = isZero ? 0 : parseFloat(dbFiatAmount);
    const diff = wucValuePrev.current
      ? Math.abs(amt * (wucValue.value - wucValuePrev.current.value))
      : 0;
    const percentage = wucValuePrev.current
      ? Math.round(
          ((wucValue.value - wucValuePrev.current.value) /
            wucValuePrev.current.value) *
            100
        )
      : 0;
    const isDown =
      wucValuePrev.current && wucValue.value < wucValuePrev.current.value;
    const isLong = diff >= 1e6;

    return [
      amt * (wucValue.value || 0),
      isDown,
      wucValuePrev.current &&
      wucValuePrev.current.currency === wucValue.currency &&
      diff !== 0 ? (
        <div
          className={classes(
            "absolute -right-2 -top-5 bg-neutral-900 rounded-md py-1 px-2 sm:w-32 sm:bg-transparent sm:px-0 sm:py-auto sm:static sm:py-0 sm:px-auto shrink-0 flex items-baseline justify-end gap-1",
            isDown ? "text-red-500" : "text-green-500"
          )}
        >
          <div
            className={classes(
              "w-0 h-0 scale-x-75 border-l-transparent border-l-8 border-r-8 border-r-transparent border-b-8 border-b-current",
              isDown ? "rotate-180" : ""
            )}
          />
          {isLong
            ? null
            : diff >= 10
            ? diff.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })
            : formatWuc(diff)}{" "}
          <span
            className={classes(
              "text-sm",
              !isLong && "before:content-['('] after:content-[')']"
            )}
          >
            {percentage}%
          </span>
        </div>
      ) : (
        <></>
      ),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wucValue, isLoading]);

  const update = async (currency: Currency) => {
    try {
      const res = (await (
        await fetch(`/api/price?currency=${currency}`)
      ).json()) as unknown as WucValueResponse;

      res.data &&
        setWucValue((prev) => {
          wucValuePrev.current = prev;
          return res.data || prev;
        });
    } catch (e) {
    } finally {
      setIsTotalLoading(false);
    }
  };

  useEffect(() => {
    if (isMounted.current) {
      setIsTotalLoading(true);
      interval.current && update(currency);

      interval.current = setInterval(() => update(currency), 10000);

      return () => {
        clearInterval(interval.current);
      };
    } else {
      isMounted.current = true;
    }
  }, [currency, dbFiatAmount, interval]);

  useEffect(() => {
    setWucValue(props.wucValue);
  }, [props.wucValue]);

  useEffect(() => {
    setIsTotalLoading(isLoading);
  }, [isLoading]);

  const fontSize = useMemo(() => {
    if (wucTotal > 1e6) {
      return "text-2xl";
    }

    return "text-3xl";
  }, [wucTotal]);

  useEffect(() => {
    setCookie(
      "fiatAmount",
      fiatAmount.length === 0 ? "0" : fiatAmount.toString()
    );
  }, [fiatAmount, setCookie]);

  return (
    <div className="container px-6 flex items-start justify-center md:px-0">
      <div className="flex w-full flex-col items-center justify-center gap-8 md:w-[500px] md:max-w-full">
        <h1 className="font-mono font-light text-3xl mb-6">WUC Converter</h1>
        <div className="flex relative items-center justify-center rounded-xl bg-neutral-800 py-2 px-4 w-full !cursor-pointer">
          <div className="flex w-full h-full items-end">
            <label
              htmlFor="amount"
              className="w-6 pr-2 text-right text-neutral-300 relative -top-0.5 cursor-pointer"
            >
              {isLoading ? (
                <Skeleton containerClassName="w-2 !leading-none" />
              ) : (
                SYMBOLS[currency]
              )}
            </label>
            <div className="relative flex-1 flex items-end h-10">
              {isLoading ? (
                <Skeleton
                  containerClassName="h-full w-full !leading-none block"
                  className="h-full !leading-loose"
                />
              ) : (
                <CurrencyInput
                  ref={inputRef}
                  width="auto"
                  name="amount"
                  placeholder="0"
                  className="bg-transparent focus:outline-none w-full text-3xl font-bold text-white"
                  value={fiatAmount}
                  onFocus={(e) => e.currentTarget.select()}
                  onValueChange={(value?: string) => {
                    if (!value) {
                      setFiatAmount("");
                      return;
                    }

                    setFiatAmount(value);
                  }}
                />
              )}
            </div>
            <div className="w-12 shrink-0">
              {isLoading ? (
                <Skeleton className="w-full !leading-none" />
              ) : (
                <select
                  className="absolute -right-2 -top-5 text-neutral-300 bg-neutral-900 rounded-md py-1 px-2 sm:static sm:bg-transparent sm:py-0 sm:px-0"
                  value={currency}
                  onChange={(e) => {
                    setCurrency(e.currentTarget.value as Currency);
                  }}
                >
                  {CURRENCIES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
        <ArrowLeftRight className="text-neutral-500 w-8 h-8 rotate-90" />
        <div className="relative w-full">
          {!isTotalLoading && (
            <div className="absolute left-2 top-0 flex items-center bottom-0 z-10">
              <Image
                alt="Loading"
                src={spinner}
                className="opacity-80"
                width="24"
                height="24"
              />
            </div>
          )}
          <motion.div
            className="flex relative items-end justify-between gap-4 rounded-xl py-2 px-4 w-full"
            key={wucTotal}
            initial={{
              ...(isLoading || !interval.current
                ? ANIMATE.neutral
                : isDown &&
                  wucValuePrev.current &&
                  wucValuePrev.current.currency === wucValue?.currency
                ? ANIMATE.down
                : ANIMATE.up),
            }}
            animate={ANIMATE.neutral}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <div className="pl-6 text-sm sm:text-base h-10 flex items-center flex-1">
              {isLoading || isTotalLoading ? (
                <Skeleton
                  containerClassName="h-full w-full !leading-none block"
                  className="h-full !leading-loose"
                />
              ) : (
                <div className="flex items-baseline gap-2 text-neutral-300 truncate">
                  <span
                    className={classes(
                      "font-bold text-white max-w-full",
                      fontSize
                    )}
                  >
                    {formatWuc(wucTotal)}
                  </span>
                  {"  "}
                  WUC
                </div>
              )}
            </div>

            {!isTotalLoading && diffDisplay ? (
              diffDisplay
            ) : (
              <Skeleton
                containerClassName="w-32 h-full hidden sm:block"
                className="w-full h-full"
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
