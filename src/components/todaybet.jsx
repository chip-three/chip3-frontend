import { useEffect, useState } from "react";
import axios from "axios";
import { serverURL } from "../App";
import { ethers } from "ethers";
import { menustatu, coinbalance } from "../store/atom";
import { useAtom } from "jotai";
import cn from "classnames";
import { motion } from "framer-motion";
import LayoutAnimation from "./layoutAnimation";

function TodayBetting() {
  const [history, sethistory] = useState([]);
  const [showrightbar, setshowrightbar] = useAtom(menustatu);

  useEffect(() => {
    gethistory();
  }, []);

  const gethistory = async () => {
    let res = await axios.get(`${serverURL}/history_today`);
    console.log(res.data);
    sethistory(res.data);
  };
  const timestamp2time = (timestamp) => {
    let yourDate = new Date(timestamp * 1000);
    return yourDate.toDateString() + yourDate.toTimeString();
  };
  const bignumberToint = (bignumber) => {
    return ethers.utils.formatEther(bignumber.toString()).toString();
  };

  return (
    <LayoutAnimation>
      <div className={cn("rightpadding", !showrightbar && "nopadding")}>
        <h1>Today bets</h1>
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg m-2">
          {history.length != 0 ? (
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Match
                  </th>
                  <th scope="col" className="px-6 py-3">
                    StartTime
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Team
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, key) => (
                  <tr
                    key={key}
                    className="border-b dark:bg-gray-900 dark:border-gray-700"
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray whitespace-nowrap dark:text-white"
                    >
                      {item.teamName} vs {item.otherteam}
                    </th>
                    <td className="px-6 py-4">
                      {timestamp2time(item.startTime)}
                    </td>
                    <td className="px-6 py-4">{bignumberToint(item.amount)}</td>
                    <td className="px-6 py-4">{item.teamName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <>No bets</>
          )}
        </div>
      </div>
    </LayoutAnimation>
  );
}

export default TodayBetting;
