import { useEffect, useState } from "react";
import axios from "axios";
import { serverURL } from "../App";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { useAtom } from "jotai";
import { RiWirelessChargingFill } from "react-icons/ri";
import { GiSoccerBall } from "react-icons/gi";
import { TbAntennaBars4 } from "react-icons/tb";
import { menustatu } from "../store/atom";
import cn from "classnames";
import { motion } from "framer-motion";
import LayoutAnimation from "./layoutAnimation";

function History() {
  const [history, sethistory] = useState([]);
  const navigate = useNavigate();
  const { isConnected, address } = useAccount();
  const [showrightbar, setshowrightbar] = useAtom(menustatu);

  useEffect(() => {
    gethistory();
  }, []);

  function generateRandomDecimalInRangeFormatted(min, max, places) {
    let value = Math.random() * (max - min + 1) + min;
    return Number.parseFloat(value).toFixed(places);
  }

  const gethistory = async () => {
    if (address) {
      let res = await axios.post(`${serverURL}/history`, {
        address: address,
      });
      sethistory(res.data);
      console.log(res.data)
    }
    // sethistory(mockdata)
  };

  const timestamp2time = (timestamp) => {
    let yourDate = new Date(timestamp * 1000);
    return (
      yourDate.toISOString().split("T")[0] +
      "  " +
      yourDate.toISOString().split("T")[1]
    );
  };

  const redirect = (key) => {
    navigate("/" + history[key][0].data.fixture.id);
  };

  function getcoinbalance(wei) {
    if (wei) return wei.slice(0, wei.length - 18);
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

  return (
    <LayoutAnimation>
      <div className={cn("rightpadding", !showrightbar && "nopadding")}>
        <motion.ul
          variants={container}
          initial="hidden"
          animate="visible"
          className="p-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {history.length != 0 &&
            history.map(
              (item, key) => (
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
                        {item[0].data.league.country}.{item[0].data.league.name}
                      </div>
                      <div className="flex flex-column justify-between my-4">
                        <div className="flex flex-row gap-2 items-center justify-center">
                          <img
                            src={item[0].data.teams.home.logo}
                            className="h-10 w-10"
                          />
                          <div>{item[0].data.teams.home.name}</div>

                        </div>
                      </div>
                      <div className="flex flex-column mt-[2px]">
                        <div className="flex flex-row gap-2 items-center justify-center">
                          <img
                            src={item[0].data.teams.away.logo}
                            className="h-10 w-10"
                          />
                          <div>{item[0].data.teams.away.name}</div>
                          {timedifference(item[0].data) == "Second Half" ||
                            (timedifference(item[0].data) ==
                              "First Half" && (
                              <div className="goalNum">
                                {item[0].data.goals.away}
                              </div>
                            ))}
                        </div>
                      </div>
                      <div className="mt-2">
                              Betting amount:{getcoinbalance(item[1].amount)}
                        </div>
                    </motion.button>
                  </motion.li>
              )
              // <div className='matche_card' key={key} onClick={e=>redirect(key)}>
              //     <div className='mx-0 flex justify-between row leaguename'>
              //         <div className='col-5 col-md-5'>
              //         {item[0].data.league.name}-{item[0].data.league.country}
              //         </div>
              //         <div className='col-5 col-md-5' style={{color:status2style(item[0].data.fixture.status.long)}}>
              //         {item[0].data.fixture.status.long}
              //         </div>
              //     </div>
              //     <div className='mx-0 flex justify-content-center row starttime'>
              //         {timestamp2time(item[0].data.fixture.timestamp)}
              //     </div>
              //     <div className='mx-0 flex justify-content-center row teamname'>
              //         <div className='col-5 col-md-5'>
              //         <img src={item[0].data.teams.home.logo} className="teamlogo"></img>
              //         <p>{item[0].data.teams.home.name}</p>
              //         </div>
              //         <div className='flex flex-column justify-content-center'>:</div>
              //         <div className='col-5 col-md-5'>
              //         <img src={item[0].data.teams.away.logo} className="teamlogo"></img>
              //         <p>{item[0].data.teams.away.name}</p>
              //         </div>
              //     </div>
              //     {
              //         item[0].data.fixture.status.long == "Match Finished"?
              //         <div className='mx-0 flex justify-content-center row score'>
              //         <div className='col-5 col-md-5'>
              //             {item[0].data.goals.home}
              //         </div>
              //         <div className='flex flex-column justify-content-center'>:</div>
              //         <div className='col-5 col-md-5'>
              //         {item[0].data.goals.away}
              //         </div>
              //         </div>  :<></>
              //     }
              //     <div style={{color:"blue", fontSize:"13px"}}>
              //         Betting amount:{getcoinbalance(item[1].amount)}
              //     </div>
              // </div>
            )}
        </motion.ul>
      </div>
    </LayoutAnimation>
  );
}

export default History;
