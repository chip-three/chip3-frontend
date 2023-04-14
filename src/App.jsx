import "./css/App.css";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link, Route, Routes } from "react-router-dom";
import Match from "./components/match";
import { useNavigate, useLocation } from "react-router-dom";
import History from "./components/history";
import { RiWirelessChargingFill } from "react-icons/ri";
import { GiSoccerBall } from "react-icons/gi";
import { TbAntennaBars4 } from "react-icons/tb";
import AllBets from "./components/allbets";
import { BsFillChatLeftFill } from "react-icons/bs";
import cn from "classnames";
import "@rainbow-me/rainbowkit/styles.css";
import { useAtom } from "jotai";
import { ethers } from "ethers";
import TodayBetting from "./components/todaybet";
import Bet from "./components/bet";
import { useAccount, useSigner } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  menustatu,
  coinbalance,
  matchpage,
  tbetpage,
  mbetpage,
} from "./store/atom";
import "reactjs-navbar/dist/index.css";
import logo from "./images/accent1.png";
import logo1 from "./images/icon.png";
import data from "./constants/get_data.json";
import factoryabi from "./constants/factory.json";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";

const token = "0x6b15be00DBb3c2ffB808f40C1782F8EA83132afe";
import abi from "erc-20-abi";
import LayoutAnimation from "./components/layoutAnimation";

export const serverURL = "https://chip3-server-production.up.railway.app";
// export const serverURL = "http://127.0.0.1:5000"
const chainid = 80001;
const hexchainid = "0x13881";
const factory = "0xBf1cc2806d3506a6118Ca3308492a7cAA465Fdb7";

export const status2style = (status) => {
  if (status == "Match Cancelled") return "red";
  if (status == "Match Finished") return "blue";
  if (status == "Not Started") return "green";
  if (status == "Second Half") return "purple";
  if (status == "First Half") return "yellow";
};

function generateRandomDecimalInRangeFormatted(min, max, places) {
  let value = Math.random() * (max - min + 1) + min;
  return Number.parseFloat(value).toFixed(places);
}

function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
}

function App() {
  const [matches, setmatches] = useState([]);
  const navigate = useNavigate();
  const [showrightbar, setshowrightbar] = useAtom(menustatu);
  const [balance, setBalance] = useAtom(coinbalance);
  const [showmatchloading, setshowmatchloading] = useState(false);
  const { isConnected, address } = useAccount();
  const [value, setValue] = useState();
  const [showmodal, setshowmodal] = useState(true);
  const [amount, setamount] = useState();
  const [showloadingbutton, setshowloadingbutton] = useState(false);
  const { data: signer, isError, isLoading } = useSigner();
  const [key, setKey] = useState();
  const [showconfirm, setshowconfirm] = useState(false);
  const [matchclick, setmatchclick] = useAtom(matchpage);
  const [tmatchclick, settmatchclick] = useAtom(tbetpage);
  const [bmatchclick, setbmatchclick] = useAtom(mbetpage);
  const size = useWindowSize();
  const location = useLocation();

  useEffect(() => {
    if (isConnected) {
      let provider = new ethers.providers.JsonRpcProvider(
        "https://rpc-mumbai.maticvigil.com/"
      );
      let tokenContract = new ethers.Contract(token, abi, provider);
      tokenContract.balanceOf(address).then((res) => {
        setBalance(ethers.utils.formatEther(res.toString()).split(".")[0]);
      });
    }
  }, [isConnected]);

  useEffect(() => {
    if (location.pathname == "/today_bettings") {
      setmatchclick(false);
      settmatchclick(true);
      setbmatchclick(false);
    } else if (location.pathname == "/") {
      setmatchclick(true);
      settmatchclick(false);
      setbmatchclick(false);
    } else if (location.pathname == "/history") {
      setmatchclick(false);
      settmatchclick(false);
      setbmatchclick(true);
    } else {
      setmatchclick(false);
      settmatchclick(false);
      setbmatchclick(false);
    }
    console.log(location);
  }, [location]);
  // useEffect(()=>{
  //   if(size.width < 720) setshowrightbar(false)
  //   else setshowrightbar(true)
  // },[size])

  useEffect(() => {
    setshowmatchloading(true);
    // let config = {
    //   method: 'get',
    //   url: `${serverURL}/get_data`
    // };
    // axios(config)
    // .then(function (response) {
    //   let showdata = []
    //   for(const item of response.data){
    //     if(item.fixture.status.long == "Not Started" || item.fixture.status.long == "First Half" || item.fixture.status.long == "Second Half"){
    //       showdata.push(item)
    //     }
    //   }
    //   showdata.sort((a, b)=>{
    //     return a.fixture.timestamp - b.fixture.timestamp
    //   })
    data.sort((a, b) => {
      return a.fixture.timestamp - b.fixture.timestamp;
    });
    setmatches(data);
    setshowmatchloading(false);
    // })
  }, []);

  const timestamp2time = (timestamp) => {
    let yourDate = new Date(timestamp * 1000);
    return (
      yourDate.toISOString().split("T")[0] +
      "  " +
      yourDate.toISOString().split("T")[1]
    );
  };

  const redirect = (key) => {
    navigate("/" + matches[key].fixture.id);
  };

  async function gethistory() {
    navigate("/history");
  }

  const timedifference = (item) => {
    let now = Date.now();
    let diff = parseInt(item.fixture.timestamp) * 1000 - parseInt(now);
    if (diff > 0) {
      var daysDifference = Math.floor(parseInt(diff) / 1000 / 60 / 60);
      if (daysDifference != 0) return `Not started ${daysDifference} hour left`;
      else
        return `Not started ${Math.floor(
          parseInt(diff) / 1000 / 60
        )} Minutes left`;
    } else {
      return item.fixture.status.long;
    }
  };
  const create = async () => {
    setshowmodal(true);
    if (amount) {
      if (isConnected) {
        setshowloadingbutton(true);
        try {
          let nftContract = new ethers.Contract(factory, factoryabi, signer);
          let tokenContract = new ethers.Contract(token, abi, signer);
          let allow = await tokenContract.allowance(address, factory);
          if (parseInt(ethers.utils.formatEther(allow.toString())) < 100000) {
            let tx = await tokenContract.approve(
              factory,
              "100000000000000000000000000000000000"
            );
            await tx.wait();
          }
          let name =
            matches[key].league.name + ":" + matches[key].league.country;
          let tx = await nftContract.createContract(
            matches[key].fixture.id,
            name,
            "CH3BET",
            name,
            "CHIP3 BETTING",
            value,
            amount + "000000000000000000"
          );
          let rs = await tx.wait();

          let contracts = await nftContract.getMyContract(
            matches[key].fixture.id
          );
          tokenContract.balanceOf(address).then((res) => {
            setBalance(ethers.utils.formatEther(res.toString()).split(".")[0]);
          });

          if (rs.confirmations > 0) {
            axios.post(`${serverURL}/bet`, {
              address: address,
              matchId: matches[key].fixture.id,
              teamId: value,
              amount: amount + "000000000000000000",
              betId: contracts.length - 1,
            });
            setshowconfirm(true);
            setInterval(function () {
              setshowconfirm(false);
              setshowloadingbutton(false);
            }, 2500);
          }
        } catch (e) {
          console.log(e);
          setshowloadingbutton(false);
        }
        setshowmodal(false);
      } else {
        alert("connect wallet first");
      }
    } else {
      alert("input all");
    }
  };

  const container = {
    hidden: { opacity: 1, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 1,
        duration: 0.2,
      },
    },
  };

  const variants = {
    visible: (i) => ({
      opacity: 1,
      transition: {
        delay: i * 0.1,
      },
    }),
    hidden: { opacity: 0 },
  };

  console.log({ location });

  return (
    <html data-theme="cyberpunk">
      <div className="overflow-hidden min-h-screen">
        <div className="navbar bg-base-100">
          <div className="flex-1">
            <a className="btn btn-ghost normal-case text-xl">
              {size.width < 640 ? (
                <img
                  className="max-sm:w-[55px] max-sm:h-[55px] w-[240px] h-[60px] my-[-65px]"
                  src={logo1}
                ></img>
              ) : (
                <img
                  className="max-sm:w-[150px] max-sm:h-[35px] w-[240px] h-[60px] my-[-65px]"
                  src={logo}
                ></img>
              )}
            </a>
          </div>
          <div className="flex-none">
            <ul className="menu menu-horizontal px-1">
              <li className="max-sm:hidden">
                <span className="max-sm:hidden font-mono">
                  {balance} CHIP3{" "}
                </span>
              </li>
              <li>
                <ConnectButton
                  showBalance={{ smallScreen: false, largeScreen: false }}
                  label="CONNECT"
                />
              </li>
            </ul>
          </div>
        </div>
        <div>
          <header>
            <div className="tabs tabs-boxed mx-2">
              {/* <span
                onClick={(e) => {
                  navigate("/");
                }}
              >
                Matches
              </span>
              <span
                onClick={(e) => {
                  navigate("/today_bettings");
                }}
              >
                Today's Bets
              </span>
              <span
                onClick={(e) => {
                  gethistory();
                }}
              >
                My Bets
              </span> */}
              <Link
                className={cn({
                  tab: true,
                  ["tab-active"]: location.pathname === "/",
                })}
                to="/"
              >
                Matches
              </Link>
              <Link
                className={cn({
                  tab: true,
                  ["tab-active"]: location.pathname === "/today_bettings",
                })}
                to="/today_bettings"
              >
                Today's Bets
              </Link>
              <Link
                className={cn({
                  tab: true,
                  ["tab-active"]: location.pathname === "/history",
                })}
                to="/history"
              >
                My Bets
              </Link>
            </div>
            <AnimatePresence mode="wait">
              <Routes key={location.pathname} location={location}>
                <Route
                  exact
                  path="/"
                  element={
                    <LayoutAnimation>
                      {showmatchloading ? (
                        <div className="flex height-97 mb-3 items-center justify-center mt-[10px] resultCard mx-3">
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
                        <div>
                          <motion.ul
                            variants={container}
                            initial="hidden"
                            animate="visible"
                            className="p-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                          >
                            {matches.map((item, key) => (
                              <motion.li
                                custom={key}
                                variants={variants}
                                key={key}
                              >
                                <motion.button
                                  className="btn flex flex-col w-full h-full p-4 items-start"
                                  whileHover={{
                                    scale: 1.02,
                                    transition: { duration: 0.2 },
                                  }}
                                  onClick={() => {
                                    redirect(key);
                                  }}
                                >
                                  <div className="text-xs">
                                    {item.league.country}.{item.league.name}
                                  </div>
                                  <div className="flex flex-column justify-between text-[0.7em]">
                                    <div className="text-base-100">
                                      {timedifference(item)}
                                    </div>
                                    <span>
                                      {timedifference(item) == "Second Half" ||
                                      timedifference(item) == "First Half" ? (
                                        <RiWirelessChargingFill />
                                      ) : (
                                        <></>
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex flex-column justify-between my-4">
                                    <div className="flex flex-row gap-2 items-center justify-center">
                                      <img
                                        src={item.teams.home.logo}
                                        className="h-10 w-10"
                                      />
                                      <div>{item.teams.home.name}</div>
                                      {timedifference(item) == "Second Half" ||
                                        (timedifference(item) ==
                                          "First Half" && (
                                          <div className="goalNum">
                                            {item.goals.home}
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                  <div className="flex flex-column mt-[2px]">
                                    <div className="flex flex-row gap-2 items-center justify-center">
                                      <img
                                        src={item.teams.away.logo}
                                        className="h-10 w-10"
                                      />
                                      <div>{item.teams.away.name}</div>
                                      {timedifference(item) == "Second Half" ||
                                        (timedifference(item) ==
                                          "First Half" && (
                                          <div className="goalNum">
                                            {item.goals.away}
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                </motion.button>
                              </motion.li>
                            ))}
                          </motion.ul>

                          <input
                            type="checkbox"
                            id="modal-1"
                            className="modal-toggle"
                          />
                          {showmodal && (
                            <div className="modal">
                              <div className="modal-box  bg-[#171924]">
                                <h1 className="font-bold text-[23px] mb-[12px]">
                                  Create New Betting
                                </h1>
                                <div className="flex flex-col justify-center">
                                  <input
                                    type="text"
                                    className="bg-[#212532] input w-full"
                                    value={amount}
                                    onChange={(e) => setamount(e.target.value)}
                                    placeholder="Amount"
                                  />
                                </div>
                                <div className="modal-action">
                                  <label
                                    onClick={(e) => {
                                      create();
                                    }}
                                    className="btn"
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
                                          <span className="sr-only">
                                            Loading...
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                    Create
                                  </label>
                                  <label htmlFor="modal-1" className="btn">
                                    Close
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </LayoutAnimation>
                  }
                />
                <Route exact path="/:id" element={<Match />} />
                <Route exact path="/:id/:id1" element={<Bet />} />
                <Route exact path="/history" element={<History />} />
                <Route exact path="/allbets" element={<AllBets />} />
                <Route
                  exact
                  path="/today_bettings"
                  element={<TodayBetting />}
                />
              </Routes>
            </AnimatePresence>
          </header>
        </div>
      </div>
    </html>
  );
}

export default App;
