import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import factoryabi from "../constants/factory.json";
import cn from "classnames";
import { menustatu, coinbalance } from "../store/atom";
import { useAtom } from "jotai";
import axios from "axios";
import { motion } from "framer-motion";
import { serverURL, status2style } from "../App";
import { useAccount, useSigner } from "wagmi";

import nftabi from "../constants/erc1155.json";

const factory = "0xBf1cc2806d3506a6118Ca3308492a7cAA465Fdb7";
const token = "0x6b15be00DBb3c2ffB808f40C1782F8EA83132afe";

// const abi = require("erc-20-abi");

function Bet() {
  const { id, id1 } = useParams();
  const [data, setdata] = useState();
  const [matchdata, setmatchdata] = useState();
  const { isConnected, address } = useAccount();
  const [showrightbar, setshowrightbar] = useAtom(menustatu);
  const { data: signer, isError, isLoading } = useSigner();
  const [balance, setBalance] = useAtom(coinbalance);
  const [showmatchloading, setshowmatchloading] = useState(false);
  const [showcopied, setshowcopied] = useState(false);
  const [showconfirm, setshowconfirm] = useState(false);
  const [betlist, setbetlist] = useState([]);
  const [showloadingbutton, setshowloadingbutton] = useState(false);
  const [showloadingbutton1, setshowloadingbutton1] = useState(false);

  useEffect(() => {
    setshowmatchloading(true);
    axios
      .post(`${serverURL}/get_data_id`, {
        id: id,
      })
      .then(async (res) => {
        setmatchdata(res.data[0].data);
        let provider = new ethers.providers.JsonRpcProvider(
          "https://rpc-mumbai.maticvigil.com/"
        );
        let vestingcontract = new ethers.Contract(
          factory,
          factoryabi,
          provider
        );
        let result = await vestingcontract.getMyContract(id);
        setdata(result[id1]);
        setshowmatchloading(false);
      });

    axios
      .post(`${serverURL}/history_match`, {
        matchID: id.toString(),
        betId: id1.toString(),
      })
      .then(async (res) => {
        let temp = [];
        for (const item of res.data) {
          if (item.betId == id1) temp.push(item);
        }
        setbetlist(temp);
      });
  }, []);

  const timedifference = (timestamp) => {
    let now = Date.now();
    let diff = parseInt(timestamp) * 1000 - parseInt(now);
    if (diff > 0) {
      var daysDifference = Math.floor(parseInt(diff) / 1000 / 60 / 60);
      return ` ${daysDifference} hour left`;
    } else {
      return "";
    }
  };

  const bignumberToint = (bignumber) => {
    return ethers.utils.formatEther(bignumber.toString()).toString();
  };

  const betwin = async () => {
    console.log(data[0]);

    if (isConnected) {
      setshowloadingbutton(true);
      try {
        let tokenContract = new ethers.Contract(token, abi, signer);
        let allow = await tokenContract.allowance(address, data[0]);

        if (parseInt(ethers.utils.formatEther(allow.toString())) < 100000) {
          let tx = await tokenContract.approve(
            data[0],
            "100000000000000000000000000000000000"
          );
          await tx.wait();
        }
        let nftContract = new ethers.Contract(data[0], nftabi, signer);
        let tx = await nftContract.bet(data[6]);
        let rs = await tx.wait();

        tokenContract.balanceOf(address).then((res) => {
          setBalance(ethers.utils.formatEther(res.toString()).split(".")[0]);
        });

        if (rs.confirmations > 0) {
          axios.post(`${serverURL}/bet`, {
            address: address,
            matchId: id,
            teamId: data[6].toString(),
            amount: data[3].toString(),
            betId: id1,
          });
        }
        setshowloadingbutton(false);
        setshowconfirm(true);
        setInterval(function () {
          setshowconfirm(false);
        }, 2500);
      } catch (e) {
        console.log(e);
        setshowloadingbutton(false);
      }
    } else {
      alert("connect wallet");
    }
  };

  const betlose = async () => {
    if (isConnected) {
      setshowloadingbutton1(true);
      try {
        let tokenContract = new ethers.Contract(token, abi, signer);
        let allow = await tokenContract.allowance(address, data[0]);
        let tx;
        if (parseInt(ethers.utils.formatEther(allow.toString())) < 100000) {
          tx = await tokenContract.approve(
            data[0],
            "100000000000000000000000000000000"
          );
          await tx.wait();
        }
        let nftContract = new ethers.Contract(data[0], nftabi, signer);
        if (data[6].toString() == matchdata.teams.home.id) {
          tx = await nftContract.bet(matchdata.teams.away.id);
          let rs = await tx.wait();
          tokenContract.balanceOf(address).then((res) => {
            setBalance(ethers.utils.formatEther(res.toString()).split(".")[0]);
          });
          if (rs.confirmations > 0) {
            axios.post(`${serverURL}/bet`, {
              address: address,
              matchId: id,
              teamId: matchdata.teams.away.id,
              amount: data[3].toString(),
              betId: id1,
            });
          }
          setshowconfirm(true);
          setInterval(function () {
            setshowconfirm(false);
          }, 2500);
        } else {
          tx = await nftContract.bet(data[6]);
          let rs = await tx.wait();
          tokenContract.balanceOf(address).then((res) => {
            setBalance(ethers.utils.formatEther(res.toString()).split(".")[0]);
          });
          if (rs.confirmations > 0) {
            axios.post(`${serverURL}/bet`, {
              address: address,
              matchId: id,
              teamId: data[6].toString(),
              amount: data[3].toString(),
              betId: id1,
            });
          }
          setshowconfirm(true);
          setInterval(function () {
            setshowconfirm(false);
          }, 2500);
        }
        setshowloadingbutton1(false);
      } catch (e) {
        console.log(e);
        setshowloadingbutton1(false);
      }
    }
  };

  const share = () => {
    navigator.clipboard.writeText(window.location.href);
    setshowcopied(true);
    setInterval(function () {
      setshowcopied(false);
    }, 3000);
  };

  const teamidtostring = (id) => {
    if (matchdata.teams.home.id == id) return matchdata.teams.home.name;
    else return matchdata.teams.away.name;
  };

  return (
    <motion.main
      className="main__container"
      initial={{ width: 0 }}
      animate={{ width: "100%" }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ duration: 2 }}
    >
      <div className={cn("rightpadding", !showrightbar && "nopadding")}>
        {showcopied ? (
          <div className="duration-500 mx-3 abcenter absolute w-[250px] alert alert-success shadow-lg">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current flex-shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-[15px]">Your Betting link copied!</span>
            </div>
          </div>
        ) : (
          <></>
        )}

        {showconfirm ? (
          <div className="duration-500 mx-3 abcenter absolute w-[250px] alert alert-success shadow-lg">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current flex-shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-[15px]">Your Betting Success</span>
            </div>
          </div>
        ) : (
          <></>
        )}

        {showmatchloading ? (
          <div className="flex h-80 items-center justify-center mt-[10px] resultCard mx-3">
            <div role="status">
              <svg
                aria-hidden="true"
                className="w-10 h-10 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : (
          <>
            {matchdata ? (
              <div className="pb-[15px] mt-[26px] resultCard mx-3">
                <h1 className="title justify-center flex flex-row text-[30px] max-sm:text-[15px]">
                  <div className="text-center">
                    {matchdata.league.name} : {matchdata.league.country}
                  </div>
                </h1>
                <div className="row flex justify-center w-full">
                  <div
                    className="text-[20px] max-sm:text-[10px]"
                    style={{
                      color: status2style(matchdata.fixture.status.long),
                    }}
                  >
                    {matchdata.fixture.status.long}
                  </div>
                </div>
                <div className="row flex justify-center w-full text-[20px] max-sm:text-[10px]">
                  {matchdata.fixture.status.long == "Not Started" ? (
                    <div style={{ color: "red" }}>
                      {timedifference(matchdata.fixture.timestamp)}
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
                <br />
                <div className="mx-0 flex justify-around flex-row w-full teambigname">
                  <div className="basis-4/9 justify-center">
                    <img
                      src={matchdata.teams.home.logo}
                      className="teambiglogo"
                    ></img>
                    <p className="max-sm:text-[10px] text-[15px]">
                      {matchdata.teams.home.name}
                    </p>
                  </div>
                  <div className="basis-1/9 flex flex-col justify-between divider">
                    <div>:</div>
                    <div>{bignumberToint(data[3])} CHIP3</div>
                  </div>
                  <div className="basis-4/9 justify-center">
                    <img
                      src={matchdata.teams.away.logo}
                      className="teambiglogo"
                    ></img>
                    <p className="max-sm:text-[10px] text-[15px]">
                      {matchdata.teams.away.name}
                    </p>
                  </div>
                </div>
                <div className="row flex justify-center w-100">
                  <p className="text-[15px] max-sm:text-[10px]">
                    {matchdata.fixture.venue.name}&nbsp;&nbsp;&nbsp;
                    {matchdata.fixture.venue.city}
                  </p>
                </div>
                {matchdata.fixture.status.long == "Match Finished" ? (
                  <div className="mx-0 flex justify-center row scorebig">
                    <div className="col-5 col-md-5">{matchdata.goals.home}</div>
                    <div className="flex flex-col justify-center">:</div>
                    <div className="col-5 col-md-5">{matchdata.goals.away}</div>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            ) : (
              <div></div>
            )}

            {data && matchdata && (
              <div>
                {/* { 
                        bignumberToint(data[6]) == matchdata.teams.away.id?
                        <div> { matchdata.teams.away.name} is win <br/>(betamount is {bignumberToint(data[3])} CHIP3) </div>:
                        <div> { matchdata.teams.home.name} is win <br/>(betamount is {bignumberToint(data[3])} CHIP3)</div>
                    } */}
                <div className="flex mt-[20px] flex-wrap justify-center">
                  <label
                    onClick={(e) => share()}
                    className="btn w-[120px] max-sm:m-[3px] "
                  >
                    Share bet
                  </label>
                  <label
                    onClick={(e) => betwin()}
                    className="btn w-[120px] max-sm:m-[3px] "
                  >
                    {showloadingbutton && (
                      <div className="mr-[3px]">
                        <div role="status">
                          <svg
                            aria-hidden="true"
                            className="w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                              fill="currentColor"
                            />
                            <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="currentFill"
                            />
                          </svg>
                          <span className="sr-only">Loading...</span>
                        </div>
                      </div>
                    )}
                    Bet on Win
                  </label>
                  <label
                    onClick={(e) => betlose()}
                    className="btn w-[120px] max-sm:m-[3px] "
                  >
                    {showloadingbutton1 && (
                      <div className="mr-[3px]">
                        <div role="status">
                          <svg
                            aria-hidden="true"
                            className="w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                              fill="currentColor"
                            />
                            <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="currentFill"
                            />
                          </svg>
                          <span className="sr-only">Loading...</span>
                        </div>
                      </div>
                    )}
                    Bet on Lose
                  </label>
                </div>
              </div>
            )}

            <div className="relative overflow-x-auto shadow-md sm:rounded-lg m-2">
              {betlist.length != 0 ? (
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">
                        Match
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
                    {betlist.map((item, key) => (
                      <tr
                        key={key}
                        className="border-b dark:bg-gray-900 dark:border-gray-700"
                      >
                        <th
                          scope="row"
                          className="px-6 py-4 font-medium text-gray whitespace-nowrap dark:text-white"
                        >
                          {matchdata.teams.away.name} vs{" "}
                          {matchdata.teams.home.name}
                        </th>
                        <td className="px-6 py-4">
                          {bignumberToint(item.amount)}
                        </td>
                        <td className="px-6 py-4">
                          {teamidtostring(item.teamId)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <></>
              )}
            </div>
          </>
        )}
      </div>
    </motion.main>
  );
}

export default Bet;
