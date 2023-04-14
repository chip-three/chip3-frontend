import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { serverURL, status2style } from "../App";
import { ethers } from "ethers";
import factoryabi from "../constants/factory.json";

import { useAtom } from "jotai";
import { menustatu, coinbalance } from "../store/atom";
import { useAccount, useSigner } from "wagmi";
import cn from "classnames";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import abi from "erc-20-abi";
import LayoutAnimation from "./layoutAnimation";

const factory = "0xBf1cc2806d3506a6118Ca3308492a7cAA465Fdb7";
const token = "0x6b15be00DBb3c2ffB808f40C1782F8EA83132afe";

function Match() {
  const [schedules, setschedules] = useState([]);
  const [showmatchloading, setshowmatchloading] = useState(false);
  const [index, setIndex] = useState([]);
  const [amount, setamount] = useState();
  const [data, setdata] = useState();
  const { id } = useParams();
  const { isConnected, address } = useAccount();
  const { data: signer, isError, isLoading } = useSigner();
  const [value, setValue] = useState();
  const [showrightbar, setshowrightbar] = useAtom(menustatu);
  const [balance, setBalance] = useAtom(coinbalance);
  const navigate = useNavigate();
  const [showmodal, setshowmodal] = useState(true);
  const { pathname } = useLocation();
  const [showconfirm, setshowconfirm] = useState(false);
  const [showloadingbutton, setshowloadingbutton] = useState(false);

  const [placingBet, setPlacingBet] = useState(false);
  const [team, setTeam] = useState("");

  useEffect(() => {
    setshowmatchloading(true);
    axios
      .post(`${serverURL}/get_data_id`, {
        id: id,
      })
      .then(async (res) => {
        let provider = new ethers.providers.JsonRpcProvider(
          "https://rpc-mumbai.maticvigil.com/"
        );
        let vestingcontract = new ethers.Contract(
          factory,
          factoryabi,
          provider
        );
        let result = await vestingcontract.getMyContract(id);
        setschedules(result);
        console.log(result);
        setdata(res.data[0].data);
        setshowmatchloading(false);
      });
  }, []);

  const simpleaddress = (address) => {
    return (
      address.slice(0, 5) +
      "..." +
      address.slice(address.length - 5, address.length)
    );
  };

  const getbets = async () => {
    setshowmatchloading(true);
    let provider = new ethers.providers.JsonRpcProvider(
      "https://rpc-mumbai.maticvigil.com/"
    );
    let vestingcontract = new ethers.Contract(factory, factoryabi, provider);
    vestingcontract.getMyContract(id).then((result) => {
      setshowmatchloading(false);
      setschedules(result);
    });
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
          let name = data.league.name + ":" + data.league.country;
          let tx = await nftContract.createContract(
            id,
            name,
            "CH3BET",
            name,
            "CHIP3 BETTING",
            value,
            amount + "000000000000000000"
          );
          let rs = await tx.wait();

          let contracts = await nftContract.getMyContract(id);
          console.log(contracts);
          tokenContract.balanceOf(address).then((res) => {
            setBalance(ethers.utils.formatEther(res.toString()).split(".")[0]);
          });

          if (rs.confirmations > 0) {
            axios.post(`${serverURL}/bet`, {
              address: address,
              matchId: id,
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
          setshowloadingbutton(false);
        }
        await getbets();
        setshowmodal(false);
      } else {
        alert("connect wallet first");
      }
    } else {
      alert("input all");
    }
  };

  // const betwin = async ()=>{
  //   if(isConnected){
  //     let tokenContract = new ethers.Contract(token, abi, signer);
  //     let allow = await tokenContract.allowance(address, index[0])

  //     if(parseInt(ethers.utils.formatEther(allow.toString())) < 100000){
  //       let tx =await tokenContract.approve(index[0], '100000000000000000000000000000000000')
  //       await tx.wait()
  //     }
  //     let nftContract = new ethers.Contract(index[0], nftabi, signer);
  //     let tx =await nftContract.bet(index[6])
  //     let rs = await tx.wait()

  //     tokenContract.balanceOf(address).then(res=>{
  //       setBalance(ethers.utils.formatEther(res.toString()).split('.')[0])
  //     })

  //     if(rs.confirmations > 0){
  //       axios.post(`${serverURL}/bet`, {
  //         address: address,
  //         matchId: id,
  //         teamId: index[6].toString(),
  //         amount: index[3].toString(),
  //         betId: contracts.length
  //       })
  //     }
  //   }else{
  //     alert("connect wallet")
  //   }

  // }

  // const betlose = async ()=>{
  //   let tokenContract = new ethers.Contract(token, abi, signer);
  //   let allow = await tokenContract.allowance(address, index[0])
  //   let tx
  //   if(parseInt(ethers.utils.formatEther(allow.toString())) < 100000){
  //     tx =await tokenContract.approve(index[0], '100000000000000000000000000000000')
  //     await tx.wait()
  //   }
  //   let nftContract = new ethers.Contract(index[0], nftabi, signer);
  //   if(index[6].toString() == data.teams.home.id) {
  //     console.log(data.teams.away.id)
  //     tx = await nftContract.bet(data.teams.away.id)
  //     let rs = await tx.wait()
  //     tokenContract.balanceOf(address).then(res=>{
  //       setBalance(ethers.utils.formatEther(res.toString()).split('.')[0])
  //     })
  //     if(rs.confirmations > 0){
  //       axios.post(`${serverURL}/bet`, {
  //         address: address,
  //         matchId: id,
  //         teamId: data.teams.away.id,
  //         amount: index[3].toString()
  //       })
  //     }
  //   }
  //   else{
  //     tx = await nftContract.bet(index[6])
  //     let rs = await tx.wait()
  //     tokenContract.balanceOf(address).then(res=>{
  //       setBalance(ethers.utils.formatEther(res.toString()).split('.')[0])
  //     })
  //     if(rs.confirmations > 0){
  //       axios.post(`${serverURL}/bet`, {
  //         address: address,
  //         matchId: id,
  //         teamId: index[6].toString(),
  //         amount: index[3].toString()
  //       })
  //     }
  //   }
  // }

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

  const teamidtostring = (id) => {
    if (data.teams.home.id == id) return data.teams.home.name;
    else return data.teams.away.name;
  };

  return (
    <LayoutAnimation>
      <div>
        {showconfirm && (
          <div className="duration-500 mx-3 abcenter absolute w-[250px] max-sm: w-[100px] alert alert-success shadow-lg">
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
        )}
        <div className="h-full w-full">
          {showmatchloading ? (
            <div className="flex h-96 items-center justify-center bg-base-200 m-2 mt-4 rounded-xl py-24">
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
              {data && (
                <div className="bg-base-200 m-2 mt-4 rounded-xl py-24">
                  <motion.div
                    animate={{
                      opacity: placingBet ? 0 : 1,
                    }}
                  >
                    <h1 className="flex flex-row content-center justify-center text-[30px] max-sm:text-[15px]">
                      <div className="text-center text-primary">
                        {data.league.country}:{data.league.name}
                      </div>
                    </h1>
                    <div className="row flex justify-center w-full">
                      <div className="text-[20px] max-sm:text-[10px] text-base">
                        {data.fixture.status.long}
                      </div>
                    </div>
                    <div className="row flex justify-center w-full max-sm:text-[12px] text-[20px]">
                      {data.fixture.status.long == "Not Started" && (
                        <div style={{ color: "red" }}>
                          {timedifference(data.fixture.timestamp)}
                        </div>
                      )}
                    </div>
                  </motion.div>
                  <br />
                  <div className="flex justify-around flex-row w-full">
                    <motion.div
                      animate={{
                        opacity: placingBet && team === "away" ? 0 : 1,
                        x: placingBet && team === "home" ? 500 : 0,
                        scale: placingBet && team === "home" ? 1.5 : 1,
                      }}
                      transition={{
                        duration: 0.5,
                      }}
                    >
                      <motion.button
                        className="btn flex flex-col p-4 h-full w-64"
                        whileHover={{
                          scale: 1.02,
                          transition: { duration: 0.2 },
                        }}
                        onClick={() => {
                          setPlacingBet(!placingBet);
                          setTeam("home");
                        }}
                      >
                        <div className="flex flex-col items-center gap-4">
                          <img src={data.teams.home.logo} />
                          <div className="text-2xl text-secondary">
                            {data.teams.home.name}
                          </div>
                        </div>
                      </motion.button>
                    </motion.div>
                    <motion.div
                      animate={{
                        opacity: placingBet ? 0 : 1,
                      }}
                    >
                      <div className="basis-1/9 flex flex-col justify-between divider">
                        vs
                      </div>
                    </motion.div>
                    <motion.div
                      animate={{
                        opacity: placingBet && team === "home" ? 0 : 1,
                      }}
                    >
                      <motion.button
                        className="btn flex flex-col p-4 h-full w-64"
                        whileHover={{
                          scale: 1.02,
                          transition: { duration: 0.2 },
                        }}
                        onClick={() => {
                          setPlacingBet(true);
                          setTeam("away");
                        }}
                      >
                        <div className="flex flex-col items-center gap-4">
                          <img src={data.teams.away.logo} />
                          <div className="text-2xl text-secondary">
                            {data.teams.away.name}
                          </div>
                        </div>
                      </motion.button>
                    </motion.div>
                  </div>
                  <motion.div
                    animate={{
                      opacity: placingBet ? 0 : 1,
                    }}
                  >
                    <div className="row flex justify-center w-100 ">
                      <p className="text-[15px] max-sm:text-[10px]">
                        {data.fixture.venue.name}&nbsp;&nbsp;&nbsp;
                        {data.fixture.venue.city}
                      </p>
                    </div>
                    {data.fixture.status.long == "Match Finished" && (
                      <div className="mx-0 flex justify-center row scorebig">
                        <div className="col-5 col-md-5">{data.goals.home}</div>
                        <div className="flex flex-col justify-center">:</div>
                        <div className="col-5 col-md-5">{data.goals.away}</div>
                      </div>
                    )}
                  </motion.div>
                  <motion.div
                    className="flex flex-col justify-center items-center mt-32"
                    animate={{
                      opacity: placingBet ? 1 : 0,
                      transition: { duration: 0.5 },
                    }}
                  >
                    <div className="w-1/2">
                      <div className="flex flex-col justify-center">
                        <input
                          type="text"
                          className="input input-bordered input-secondary w-full"
                          value={amount}
                          onChange={(e) => setamount(e.target.value)}
                          placeholder="Amount"
                        />
                      </div>
                      <div className="flex flex-row items-center justify-center p-4 gap-4">
                        <button onClick={create} className="btn">
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
                          Place bet
                        </button>
                        <button
                          className="btn"
                          onClick={() => {
                            setPlacingBet(false);
                          }}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </>
          )}

          <input type="checkbox" id="modal-1" className="modal-toggle" />
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
                  <label onClick={create} className="btn">
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
      </div>
    </LayoutAnimation>
  );
}
export default Match;
