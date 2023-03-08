import './App.css';
import factoryabi from './factory.json'
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
import { CiFootball , CiBasketball} from "react-icons/ci";
import { BsFillChatLeftFill } from "react-icons/bs";
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import { AiOutlineHome , AiOutlineWechat} from "react-icons/ai"
import cn from "classnames"
import '@rainbow-me/rainbowkit/styles.css';

import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme
} from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import {
  configureChains,
  createClient,
  WagmiConfig,
  useAccount } from 'wagmi';
import { polygon, polygonMumbai} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import "reactjs-navbar/dist/index.css";
import chathistory from './fakechathistory.json'

const token = "0x6b15be00DBb3c2ffB808f40C1782F8EA83132afe"
const abi = require('erc-20-abi')

const { chains, provider } = configureChains(
  [ polygon, polygonMumbai],
  [
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

export const serverURL = "https://chip3-server-production.up.railway.app"
// export const serverURL = "http://127.0.0.1:5000"
const chainid = 80001
const hexchainid = "0x13881"

export const status2style = (status) =>{
  if(status == "Match Cancelled") return "red"
  if(status == "Match Finished") return "blue"
  if(status == "Not Started") return "green"
}

function generateRandomDecimalInRangeFormatted(min, max, places) {
  let value = (Math.random() * (max - min + 1)) + min;
  return Number.parseFloat(value).toFixed(places);
}

const {ethereum} = window

function App() {
  const [matches, setmatches]  = useState([])
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0)
  const [showrightbar, setshowrightbar] = useState(true)

  const { isConnected , address} = useAccount()

  useEffect(()=>{
    if(isConnected) {
      let provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com/')
      let tokenContract = new ethers.Contract(token, abi, provider);
      tokenContract.balanceOf(address).then(res=>{
        console.log(typeof(ethers.utils.formatEther(res.toString())))
        setBalance(ethers.utils.formatEther(res.toString()).split('.')[0])
      })
    }
  },[isConnected])

  useEffect(()=>{
    let config = {
      method: 'get',
      url: `${serverURL}/get_data`
    };
    console.log('---a')
    axios(config)
    .then(function (response) {
      let showdata = []
      for(const item of response.data){
        if(item.fixture.status.long == "Not Started"){
          showdata.push(item)
        }
      }
      showdata.sort((b,a)=>{
        return a.fixture.timestamp - b.fixture.timestamp
      })
      setmatches(showdata)
    })
  },[])

  const connect = async () =>{
    if(ethereum){
      if(ethereum.networkVersion != chainid){
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: hexchainid }], 
        });

      }
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

    }
    else
      window.location.href='https://metamask.io/download.html'
  }
  
  const timestamp2time = (timestamp)=>{
    let yourDate = new Date(timestamp * 1000)
    return yourDate.toISOString().split('T')[0] + "  " + yourDate.toISOString().split('T')[1]
  }
 
  const redirect = (key) =>{
    console.log(key)
    navigate("/" + matches[key].fixture.id)
  }

  async function gethistory(){
    navigate('/history')
  }

  const timedifference = (timestamp) =>{
    let now = Date.now()
    let diff =  parseInt(timestamp) * 1000 - parseInt(now)
    if(diff > 0){
      var daysDifference = Math.floor(parseInt(diff)/1000/60/60);
      return  ` ${daysDifference} hour left`
    }else{
      return ""
    }
  }

  return (
    <WagmiConfig client={wagmiClient}>
       <RainbowKitProvider theme={darkTheme()} chains={chains}>
        <div className='main'>
          <div className="navbar bg-[#171924] bg-base-100 borderb">
            <div className="flex-1">
              <a className="btn btn-ghost normal-case text-xl text-white ">LOGO</a>
            </div>
            <div className="flex-none">
              <ul className="menu menu-horizontal px-1">
                <li><span className='text-white'>{balance} CHIP3</span></li>
                {isConnected?
                  <li className='mr-[5px]' tabIndex={0}>
                    <button class="bg-transparent btn btn-primary border-transparent hover:bg-transparent text-white hover:border-warning" onClick={e=>gethistory()}>All bettings</button>
                  </li>:<></>
                }
                <li><ConnectButton showBalance={{ smallScreen: false, largeScreen: false}} label="CONNECT"/></li>
              </ul>
            </div>
          </div>
        <div className="App">
          <Sidebar  style={{borderColor:"#383737", fontSize:"20px"}} defaultCollapsed={true} collapsedWidth='61px'>
            <Menu>
              <MenuItem> <TbLayoutSidebarLeftCollapse/> </MenuItem>
              <MenuItem> <GiSoccerBall/></MenuItem>
              <MenuItem> <CiFootball/> </MenuItem>
              <MenuItem> <CiBasketball/> </MenuItem>
            </Menu>
          </Sidebar>
          <header className="App-header">
            <div className={cn('rightbar', !showrightbar && 'hidden')}>
              <div className='flex flex-row h-[25px]'>
                <div className='flex justify-center pt-[2px] text-sm basis-1/3 rounded-md bg-yellow-400/30'>
                  <BsFillChatLeftFill className='pr-1 mt-1'/><span>Chat</span>
                </div>
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
                <AiOutlineHome className='hover:scale-125 active:scale-100' onClick={e=>navigate('/')}/>
                <AiOutlineWechat onClick={e=>setshowrightbar(!showrightbar)} className={cn('absolute rounded-sm right-[20px] hover:scale-125 active:scale-100', showrightbar && 'hidden')}/>
            </div>
            <Routes>
              <Route exact path="/" element={
                <div className={cn('rightpadding', !showrightbar && 'nopadding')}>
                <div className='list'>
                  {
                    matches.map((item, key)=>
                      <div className="flex flex-wrap flex-col matche_card" key={key} onClick={e => redirect(key)}>
                        <div className="flex flex-column justify-between" style={{ fontSize: "11px", marginBottom: "5px" }}>
                          <div className='flex' style={{ color: "rgb(115, 120, 131)" }}><GiSoccerBall className='pt-[5px]'/> <span>{item.league.name}-{item.league.country}</span></div>
                          <span style={{color: "rgb(115, 120, 131)"}}><TbAntennaBars4 /></span>
                        </div>
                        <div className="flex flex-column justify-between" style={{ fontSize: "11px", marginBottom: "5px" }}>
                          <div style={{ color: "yellow" }}>{item.fixture.status.long}:{timedifference(item.fixture.timestamp)}</div>
                          <span style={{color: "red", fontSize: "13px"}}><RiWirelessChargingFill /></span>
                        </div>
                        <div className="flex flex-column justify-between" style={{ fontSize: "14px" }}>
                          <div  style={{ width: "180px" }}>
                            <p className='text-left' style={{ display: "line", float: "left"}}>{item.teams.home.name}</p>
                          </div>
                          <div className="goalNum">{item.goals.home}</div>
                        </div>
                        <div className="flex flex-column justify-between mt-[2px]" style={{ fontSize: "14px" }}>
                          <div style={{ width: "180px" }}>
                            <p className='text-left' style={{ display: "line", float: "left"}}>{item.teams.away.name}</p>
                          </div>
                          <div className="goalNum">{item.goals.away}</div>
                        </div>
                        <div className="flex flex-column justify-between" style={{ fontSize: "14px", marginBottom: "5px" }}>
                          <span style={{ color: "rgb(115, 120, 131)", fontSize: "11px"}}>1x2</span>
                        </div>
                        <div className="flex flex-column justify-between" style={{ fontSize: "14px" }}>
                          <div className="btnDiv flex-fill">
                            <span style={{color: "rgb(115, 120, 131)", float: "left"}}>{item.teams.home.name}</span>
                            <span style={{color: "white", float: "right"}}>{generateRandomDecimalInRangeFormatted(1, 99, 2)}</span>
                          </div>
                          <div className="btnDiv flex-fill">
                            <span style={{color: "rgb(115, 120, 131)", float: "left"}}>{item.teams.away.name}</span>
                            <span style={{color: "white", float: "right"}}>{generateRandomDecimalInRangeFormatted(1, 99, 2)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                </div>
              </div>
              }/>
              <Route exact path="/:id" element={<Match/>}/>
              <Route exact path="/history" element ={<History/>}/>
              <Route exact path="/allbets" element ={<AllBets/>}/>

            </Routes>
          </header>
        </div>
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
