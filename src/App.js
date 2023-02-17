import './App.css';
import factoryabi from './factory.json'
import {useState, useEffect} from 'react'
import axios from 'axios'
import { Route, Routes} from 'react-router-dom';
import Match from './match';
import { useNavigate } from "react-router-dom";
import History from './history';
import mockdata from './get_data.json';
import { RiWirelessChargingFill } from 'react-icons/ri';
import { GiSoccerBall } from 'react-icons/gi';
import { TbAntennaBars4 } from 'react-icons/tb';
import AllBets from './allbets'
import { Sidebar, Menu, MenuItem, useProSidebar } from 'react-pro-sidebar';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
 
import "reactjs-navbar/dist/index.css";

const abi = require('erc-20-abi')

// export const serverURL = "https://chip3-server-production.up.railway.app"
export const serverURL = "http://127.0.0.1:5000"
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
  const [schedules, setschedules] = useState([])
  const [account, setAccount] = useState()
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState([])
  const [current, setCurrent] = useState()
  const [matches, setmatches]  = useState([])
  const [name, setname] = useState()
  const [symbol, setsymbol] = useState()
  const [title, settitle] = useState()
  const [description, setdescription] = useState()
  const [amount, setamount] = useState()
  const [firsturi, setfirsturi] = useState()
  const [seconduri, setseconduri] = useState()
  const [matchdata, setmatchdata] = useState()
  const [history, sethistory] = useState([])
  const navigate = useNavigate();

  const { collapseSidebar } = useProSidebar();
  
  useEffect(()=>{
    connect()
    let config = {
      method: 'get',
      url: `${serverURL}/get_data`
    };
    console.log('---a')
    // axios(config)
    // .then(function (response) {
    //   let showdata = []
    //   for(const item of response.data){
    //     if(item.fixture.status.long == "Not Started"){
    //       showdata.push(item)
    //     }
    //   }
    //   showdata.sort((a,b)=>{
    //     return a.fixture.timestamp - b.fixture.timestamp
    //   })
    //   setmatches(showdata)
    // })
    
      let showdata = []
      // for(const item of mockdata){
      //   if(item.fixture.status.long == "Not Started"){
      //     showdata.push(item)
      //   }
      // }
      // showdata.sort((a,b)=>{
      //   return a.fixture.timestamp - b.fixture.timestamp
      // })
      showdata.push(...mockdata)
      setmatches(showdata)
  },[])

  const connect = async () =>{
    if(ethereum){
      if(ethereum.networkVersion != chainid){
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: hexchainid }], // chainId must be in hexadecimal numbers
        });

      }
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if(accounts){
        setAccount(accounts[0]);
      }
    }
    else
      window.location.href='https://metamask.io/download.html'
  }

  const simpleaddress = (address) =>{
    return address.slice(0,5) + "..."+ address.slice(address.length - 5, address.length)
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

  return (
    <div>
    <Box sx={{ flexGrow: 1}}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            LOGO
          </Typography>
          <Button onClick={e=>navigate("/allbets")}>All bettings</Button>
          {account ?<Button onClick={e=>gethistory()} variant="contained">{simpleaddress(account)}</Button>:<Button onClick={connect} variant="contained">Connect</Button>}
        </Toolbar>
      </AppBar>
    </Box>
    <div className="App">
      <Sidebar style={{borderColor:"#383737"}} width = {200}>
        <Menu>
          <MenuItem> <GiSoccerBall/> Soccer</MenuItem>
        </Menu>
      </Sidebar>
      <header className="App-header">
        <Routes>
          <Route exact path="/" element={
            <div>
            <h2 className='title'>Today matches</h2>
            <div className='list'>
              {
                matches.map((item, key)=>
                //   <div className='matche_card' key={key} onClick={e=>redirect(key)}>
                //     <div className='mx-0 d-flex justify-content-between row leaguename'>
                //       <div className='col-5 col-md-5'>
                //         {item.league.name}-{item.league.country}
                //       </div>
                //       <div className='col-5 col-md-5' style={{color:status2style(item.fixture.status.long)}}>
                //         {item.fixture.status.long}
                //       </div>
                //     </div>
                //     <div className='mx-0 d-flex justify-content-center row starttime'>
                //       {timestamp2time(item.fixture.timestamp)}
                //     </div>
                //     <div className='mx-0 d-flex justify-content-center row teamname'>
                //       <div className='col-5 col-md-5'>
                //         {/* <img src={item.teams.home.logo} className="teamlogo"></img> */}
                //         <div className='fakelogo'></div>
                //         <p>{item.teams.home.name}</p>
                //       </div>
                //       <div className='d-flex flex-column justify-content-center'>:</div>
                //       <div className='col-5 col-md-5'>
                //         {/* <img src={item.teams.away.logo} className="teamlogo"></img> */}
                //         <div className='fakelogo'></div>
                //         <p>{item.teams.away.name}</p>
                //       </div>
                //     </div>
                //     {
                //       item.fixture.status.long == "Match Finished"?
                //       <div className='mx-0 d-flex justify-content-center row score'>
                //         <div className='col-5 col-md-5'>
                //           {item.goals.home}
                //         </div>
                //         <div className='d-flex flex-column justify-content-center'>:</div>
                //         <div className='col-5 col-md-5'>
                //         {item.goals.away}
                //         </div>
                //       </div>  :<></>
                //     }
                    
                //   </div>
                  <div className="d-flex flex-column matche_card" key={key} onClick={e=>redirect(key)}>
                    <div className="d-flex flex-row justify-content-between" style={{ fontSize: "11px", marginBottom: "5px" }}>
                      <div style={{ color: "rgb(115, 120, 131)" }}><GiSoccerBall /> {item.league.name}-{item.league.country}</div>
                      <span style={{color: "rgb(115, 120, 131)"}}><TbAntennaBars4 /></span>
                    </div>
                    <div className="d-flex flex-row justify-content-between" style={{ fontSize: "11px", marginBottom: "5px" }}>
                      <div style={{ color: "yellow" }}>{item.fixture.status.long}</div>
                      <span style={{color: "red", fontSize: "13px"}}><RiWirelessChargingFill /></span>
                    </div>
                    <div className="d-flex flex-row justify-content-between" style={{ fontSize: "14px" }}>
                      <div style={{ width: "180px" }}>
                        <img src={item.teams.home.logo} className="teamlogo"></img>
                        <p style={{ display: "line", float: "left", marginLeft: "10px"}}>{item.teams.home.name}</p>
                      </div>
                      <div className="goalNum">{item.goals.home}</div>
                    </div>
                    <div className="d-flex flex-row justify-content-between" style={{ fontSize: "14px" }}>
                      <div style={{ width: "180px" }}>
                        <img src={item.teams.away.logo} className="teamlogo"></img>
                        <p style={{ display: "line", float: "left", marginLeft: "10px"}}>{item.teams.away.name}</p>
                      </div>
                      <div className="goalNum">{item.goals.away}</div>
                    </div>
                    <div className="d-flex flex-row justify-content-between" style={{ fontSize: "14px", marginBottom: "5px" }}>
                      <span style={{ color: "rgb(115, 120, 131)", fontSize: "11px"}}>1x2</span>
                    </div>
                    <div className="d-flex flex-row justify-content-between" style={{ fontSize: "14px" }}>
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
  );
}

export default App;
