import './App.css';
import {useState, useEffect} from 'react'
import axios from 'axios'
import { Route, Routes} from 'react-router-dom';
import Match from './match';
import { useNavigate } from "react-router-dom";
import History from './history';
import { RiWirelessChargingFill } from 'react-icons/ri';
import { GiSoccerBall } from 'react-icons/gi';
import { TbAntennaBars4 } from 'react-icons/tb';
import AllBets from './allbets'
import { Sidebar, Menu, MenuItem } from 'react-pro-sidebar';
import { BsFillChatLeftFill } from "react-icons/bs";
import { AiOutlineHome , AiOutlineWechat, AiOutlineHistory} from "react-icons/ai"
import cn from "classnames"
import '@rainbow-me/rainbowkit/styles.css';
import { useAtom } from 'jotai'
import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme
} from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import TodayBetting from './todaybet';
import Bet from './bet'
import {
  useAccount,
  useSigner 
} from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { menustatu, coinbalance } from './atom'
import "reactjs-navbar/dist/index.css";
import chathistory from './fakechathistory.json'
import logo from './accent1.png'
import logo1 from './icon.png'

import factoryabi from './factory.json'

const token = "0x6b15be00DBb3c2ffB808f40C1782F8EA83132afe"
const abi = require('erc-20-abi')

export const serverURL = "https://chip3-server-production.up.railway.app"
// export const serverURL = "http://127.0.0.1:5000"
const chainid = 80001
const hexchainid = "0x13881"
const factory = "0xBf1cc2806d3506a6118Ca3308492a7cAA465Fdb7"

export const status2style = (status) =>{
  if(status == "Match Cancelled") return "red"
  if(status == "Match Finished") return "blue"
  if(status == "Not Started") return "green"
  if(status == "Second Half") return "purple"
  if(status == "First Half") return "yellow"
}

function generateRandomDecimalInRangeFormatted(min, max, places) {
  let value = (Math.random() * (max - min + 1)) + min;
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
  const [matches, setmatches]  = useState([])
  const navigate = useNavigate();
  const [showrightbar, setshowrightbar] = useAtom(menustatu)
  const [balance, setBalance] = useAtom(coinbalance)
  const [showmatchloading, setshowmatchloading] = useState(false)
  const {isConnected , address} = useAccount()
  const [value, setValue] = useState();
  const [showmodal, setshowmodal] = useState(true)
  const [amount, setamount] = useState()
  const [showloadingbutton, setshowloadingbutton] = useState(false)
  const { data: signer, isError, isLoading } = useSigner()
  const [key, setKey] = useState()
  const [showconfirm, setshowconfirm] = useState(false)
  const size = useWindowSize()

  useEffect(()=>{
    if(isConnected) {
      let provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com/')
      let tokenContract = new ethers.Contract(token, abi, provider);
      tokenContract.balanceOf(address).then(res=>{
        setBalance(ethers.utils.formatEther(res.toString()).split('.')[0])
      })
    }
  },[isConnected])

  useEffect(()=>{
    if(size.width < 720) setshowrightbar(false)
    else setshowrightbar(true)
  },[size])

  useEffect(()=>{
    setshowmatchloading(true)
    let config = {
      method: 'get',
      url: `${serverURL}/get_data`
    };
    axios(config)
    .then(function (response) {
      let showdata = []
      for(const item of response.data){
        if(item.fixture.status.long == "Not Started" || item.fixture.status.long == "First Half" || item.fixture.status.long == "Second Half"){
          showdata.push(item)
        }
      }
      showdata.sort((a, b)=>{
        return a.fixture.timestamp - b.fixture.timestamp
      })
      setmatches(showdata)
      setshowmatchloading(false)
    })
  },[])
  
  const timestamp2time = (timestamp)=>{
    let yourDate = new Date(timestamp * 1000)
    return yourDate.toISOString().split('T')[0] + "  " + yourDate.toISOString().split('T')[1]
  }
 
  const redirect = (key) =>{
    navigate("/" + matches[key].fixture.id)
  }

  async function gethistory(){
    navigate('/history')
  }
  
  const timedifference = (item) =>{
    let now = Date.now()
    let diff =  parseInt(item.fixture.timestamp) * 1000 - parseInt(now)
    if(diff > 0){
      var daysDifference = Math.floor(parseInt(diff)/1000/60/60);
      if(daysDifference != 0)
        return  `Not started ${daysDifference} hour left`
      else return `Not started ${Math.floor(parseInt(diff)/1000/60)} Minutes left`
    }else{
      return item.fixture.status.long
    }
  }
  const create = async ()=>{
    setshowmodal(true)
    if(amount){
      if(isConnected){
        setshowloadingbutton(true)
        try{
          let nftContract = new ethers.Contract(factory, factoryabi, signer);
          let tokenContract = new ethers.Contract(token, abi, signer);
          let allow = await tokenContract.allowance(address, factory)
          if(parseInt(ethers.utils.formatEther(allow.toString())) < 100000){
            let tx = await tokenContract.approve(factory, '100000000000000000000000000000000000')
            await tx.wait()
          }
          let name = matches[key].league.name + ":" + matches[key].league.country
          let tx = await nftContract.createContract( matches[key].fixture.id , name, 'CH3BET', name, "CHIP3 BETTING", value, amount + "000000000000000000")
          let rs = await tx.wait()

          let contracts = await nftContract.getMyContract( matches[key].fixture.id)
          tokenContract.balanceOf(address).then(res=>{
            setBalance(ethers.utils.formatEther(res.toString()).split('.')[0])
          })

          if(rs.confirmations > 0){
            axios.post(`${serverURL}/bet`, {
              address: address,
              matchId:  matches[key].fixture.id, 
              teamId: value, 
              amount: amount + "000000000000000000",
              betId: contracts.length - 1
            })
            setshowconfirm(true)
            setInterval(function(){      
              setshowconfirm(false)
              setshowloadingbutton(false)
            }, 2500)
          }
        }
        catch(e){
          setshowloadingbutton(false)
        }
        setshowmodal(false)
      }else{
        alert("connect wallet first")
      }
    } else{
        alert('input all')
    }
    
  }
  

  return (
        <div className='main'>
          <div className="navbar bg-[#171924] borderb">
            <div className="flex-1">
              <a className="btn btn-ghost normal-case text-xl text-white ">
                {
                  size.width < 640 ?
                <img className='max-sm:w-[55px] max-sm:h-[55px] w-[240px] h-[60px] my-[-65px]' src={logo1}></img>:
                <img className='max-sm:w-[150px] max-sm:h-[35px] w-[240px] h-[60px] my-[-65px]' src={logo}></img>
                }
              </a>
            </div>
            <div className="flex-none">
              <ul className="menu menu-horizontal px-1">
                <li className='max-sm:hidden'><span className='max-sm:hidden text-white'>{balance} CHIP3 </span></li>
                <li><ConnectButton showBalance={{ smallScreen: false, largeScreen: false}} label="CONNECT"/></li>
              </ul>
            </div>
          </div>
        <div className="App">
          <Sidebar  style={{borderColor:"#383737", fontSize:"20px"}} defaultCollapsed={true} collapsedWidth='40px'>
            <Menu>
              {/* <MenuItem> <TbLayoutSidebarLeftCollapse/> </MenuItem> */}
              <MenuItem> <GiSoccerBall/></MenuItem>
              {/* <MenuItem> <CiFootball/> </MenuItem>
              <MenuItem> <CiBasketball/> </MenuItem> */}
            </Menu>
          </Sidebar>
          <header className="App-header">
            <div className={cn('rightbar', !showrightbar && 'hidden')}>
              <div className='flex flex-row h-[25px]'>
                <div className='flex justify-center pt-[2px] text-sm basis-1/3 rounded-md bg-yellow-400/30'>
                  <BsFillChatLeftFill className='pr-1 mt-1'/><span>Chat</span>
                </div>
                {
                  isConnected?
                    <button className="bg-transparent btn p-[2px] ml-[3px] min-h-[30px] h-[30px] border-transparent hover:bg-transparent text-white hover:border-warning" onClick={e=>gethistory()}>HISTORY</button>
                  :<></>
                } 
                <div className='absolute top-[-5px] right-[15px] cursor-pointer hover:scale-125 active:scale-100' value={showrightbar} onClick={e=>setshowrightbar(e.target.value)}>x</div>
                &nbsp; 
              </div>
              {
                chathistory.map((item)=>
                <div className='chatitem flex flex-wrap'>
                  <img className='fakechatavatar'></img>&nbsp;
                  <span className='username'>{item.username}</span>
                    :&nbsp;
                  <span className='message'>{item.message}</span>  
                </div>)
              }
            </div>
            <div className='menubar flex'>
                <AiOutlineHome className='text-[24px] hover:scale-125 active:scale-100' onClick={e=>navigate('/')}/>
                <AiOutlineHistory className='text-[24px] ml-[15px] hover:scale-125 active:scale-100' onClick={e=>navigate('/today_bettings')}/>
                <AiOutlineWechat onClick={e=>setshowrightbar(true)} className={cn('absolute rounded-sm right-[20px] text-[24px] hover:scale-125 active:scale-100', showrightbar && 'hidden')}/>
            </div>
            <Routes>
              <Route exact path="/" element={
                <div className={cn('rightpadding', !showrightbar && 'nopadding')}>
                  {
                    showmatchloading?
                    <div className="flex height-97 mb-3 items-center justify-center mt-[10px] resultCard mx-3">
                      <div role="status">
                        <svg aria-hidden="true" className="w-10 h-10 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                        </svg>
                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>:
                    <div className='list'>
                    {
                      matches.map((item, key)=>
                        <div className="flex flex-wrap flex-col matche_card" key={key} onClick={e => redirect(key)}>
                          <div className="flex flex-column justify-between" style={{ fontSize: "11px", marginBottom: "5px" }}>
                            <div className='flex' style={{ color: "rgb(115, 120, 131)" }}><GiSoccerBall className='pt-[5px]'/> <span>{item.league.name}-{item.league.country}</span></div>
                            <span style={{color: "rgb(115, 120, 131)"}}><TbAntennaBars4 /></span>
                          </div>
                          <div className="flex flex-column justify-between" style={{ fontSize: "11px", marginBottom: "5px" }}>
                            <div style={{ color: "yellow" }}>{timedifference(item)}</div>
                            <span style={{color: "red", fontSize: "13px"}}>{timedifference(item) == "Second Half" || timedifference(item) == "First Half" ? <RiWirelessChargingFill /> : <></>}</span>
                          </div>
                          <div className="flex flex-column justify-between" style={{ fontSize: "14px" }}>
                            <div  className='flex'>
                              <img src={item.teams.home.logo} className="teamlogo"></img>
                              <p className='text-left' style={{ display: "line", float: "left"}}>{item.teams.home.name}</p>
                            </div>
                            {
                              timedifference(item) == "Second Half" || timedifference(item) == "First Half" ?
                              <div className="goalNum">{item.goals.home}</div>
                             : <></>
                            }
                            {/* <div className="goalNum">{item.goals.home}</div> */}
                          </div>
                          <div className="flex flex-column justify-between mt-[2px]" style={{ fontSize: "14px" }}>
                            <div className='flex'>
                            <img src={item.teams.away.logo} className="teamlogo"></img>
                              <p className='text-left' style={{ display: "line", float: "left"}}>{item.teams.away.name}</p>
                            </div>
                            {
                              timedifference(item) == "Second Half" || timedifference(item) == "First Half" ?
                              <div className="goalNum">{item.goals.away}</div>
                             : <></>
                            }
                            {/* <div className="goalNum">{item.goals.away}</div> */}
                          </div>
                          <div className="flex flex-row justify-between test-[14px] mb-[5px]">
                            <span  style={{ color: "rgb(115, 120, 131)", fontSize: "11px"}}>1x2</span>
                          </div>
                          <div className="flex flex-row justify-between gap-[10px] test-[14px]">
                              <label htmlFor="modal-1" onClick={e=>{e.stopPropagation();setshowmodal(true); setKey(key) ;setValue(item.teams.home.id)}} className="btnDiv basis-1/2 justify-between flex-auto btn modal-button">
                                <span style={{color: "rgb(115, 120, 131)", float: "left"}} >
                                  {item? item.teams.home.name: ""}
                                </span>
                                {/* <span style={{color: "white", float: "right"}}>50</span> */}
                              </label>
                              <label htmlFor="modal-1" onClick={e=>{e.stopPropagation();setshowmodal(true); setKey(key) ; setValue(item.teams.away.id);}} className="btnDiv basis-1/2 justify-between flex-auto btn modal-button">
                                <span style={{color: "rgb(115, 120, 131)", float: "left"}} >
                                  {item? item.teams.away.name: ""}
                                </span>
                                {/* <span style={{color: "white", float: "right"}}>50</span> */}
                              </label>
                          </div>
                        </div>
                      )
                    }

                  <input type="checkbox" id="modal-1" className="modal-toggle" />
                    {
                    showmodal?
                    <div className="modal">
                      <div className="modal-box  bg-[#171924]">
                        <h1 className="font-bold text-[23px] mb-[12px]">Create New Betting</h1>
                        <div className="flex flex-col justify-center">
                          <input type="text" className="bg-[#212532] input w-full"  value={amount} onChange={e=>setamount(e.target.value)} placeholder="Amount" />
                        </div>
                        <div className="modal-action">
                          <label onClick={e=>{create()}} className="btn">
                          {
                            showloadingbutton&&
                            <div className="mr-[3px]">
                              <div role="status">
                                <svg aria-hidden="true" className="w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                </svg>
                                <span className="sr-only">Loading...</span>
                              </div>
                            </div>
                            }
                            Create
                            </label>
                          <label htmlFor="modal-1" className="btn">Close</label>
                        </div>
                      </div>
                    </div>:
                    <></>}
                  </div>
                  }

              </div>
              }/>
              <Route exact path="/:id" element={<Match/>}/>
              <Route exact path="/:id/:id1" element={<Bet/>}/>
              <Route exact path="/history" element ={<History/>}/>
              <Route exact path="/allbets" element ={<AllBets/>}/>
              <Route exact path="/today_bettings" element ={<TodayBetting/>}/>
            </Routes>
          </header>
        </div>
        </div>
  );
}

export default App;
