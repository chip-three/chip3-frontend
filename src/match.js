import {useParams} from "react-router-dom";
import { useEffect, useState } from "react";
import axios from 'axios'
import { serverURL , status2style} from "./App";
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { ethers } from 'ethers';
import factoryabi from './factory.json'
import nftabi from './erc1155.json'
import Button from '@mui/material/Button';


import {
  useAccount,
  useConnect,
  useContract,
  useContractRead,
  useContractWrite,
   usePrepareContractWrite,
  useProvider,
  useWaitForTransaction,
  useSigner 
} from "wagmi";

const abi = require('erc-20-abi')

const {ethereum} = window

const factory = "0xBf1cc2806d3506a6118Ca3308492a7cAA465Fdb7"
const token = "0x6b15be00DBb3c2ffB808f40C1782F8EA83132afe"

function generateRandomDecimalInRangeFormatted(min, max, places) {
  let value = (Math.random() * (max - min + 1)) + min;
  return Number.parseFloat(value).toFixed(places);
}

function Match() {
    const [schedules, setschedules] = useState([])
    const [open, setOpen] = useState(false);
    const [openbet, setopenbet] = useState(false)
    const [index, setIndex] = useState([])
    const [description, setdescription] = useState()
    const [amount, setamount] = useState()
    const [data, setdata] = useState()
    const {id} = useParams();
   

    const { activeConnector, isConnected , address} = useAccount()
    const { connect, connectors, error, pendingConnector } = useConnect()

    const { data: signer, isError, isLoading } = useSigner()

    const [accounts, setAccount] = useState()

    const [value, setValue] = useState();

    const [value1, setValue1] = useState('1');
  
    const handleChange1 = (event, newValue) => {
      setValue1(newValue);
    };

    const handleChange = (event) => {
      setValue(event.target.value);
      console.log(event.target.value)
    };

    useEffect(()=>{
      console.log(signer, isError, isLoading)
      timedifference()
      let config = {
          method: 'get',
          url: `${serverURL}/get_data`
        };
    
        axios(config)
        .then(function (response) {
          for(let item of response.data ){
            if(item.fixture.id == id){
              setdata(item)
              console.log(item)
            }
          }
        })

      let provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com/')
      let vestingcontract = new ethers.Contract(factory, factoryabi, provider);
      vestingcontract.getMyContract(id)
      .then(result=>{
          setschedules(result)
      })
    },[])

    const simpleaddress = (address) =>{
      return address.slice(0,5) + "..."+ address.slice(address.length - 5, address.length)
    }
    
    const getbets = async () =>{
      let provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com/')
      let vestingcontract = new ethers.Contract(factory, factoryabi, provider);
      vestingcontract.getMyContract(id)
      .then(result=>{
          setschedules(result)
          console.log(result, id)
      })
    }

    const handleClickOpen = (key) => {
      setopenbet(true);
      setIndex(schedules[key])
    };


    const handleClose = () => {
      setOpen(false);
    };

    const handleClosebet = () => {
      setopenbet(false);
    };
    
    const create = async ()=>{
      if(description && amount){
        if(isConnected){
          console.log(address, signer, isError, isLoading)
          let nftContract = new ethers.Contract(factory, factoryabi, signer);
          let tokenContract = new ethers.Contract(token, abi, signer);
          let allow = await tokenContract.allowance(address, factory)
          if(parseInt(ethers.utils.formatEther(allow.toString())) < 100000){
            let tx = await tokenContract.approve(factory, '100000000000000000000000000000000000')
            await tx.wait()
          }
          let name = data.league.name + ":" + data.league.country
          let tx = await nftContract.createContract(id, name, 'CH3BET', name, description, value, amount + "000000000000000000")
          let rs = await tx.wait()
          console.log(rs)
          if(rs.confirmations > 0){
            axios.post(`${serverURL}/bet`, {
              address: address,
              matchId: id, 
              teamId: value, 
              amount: amount
            })
          }
          await getbets()
        }else{
          alert("connect wallet first")
        }
      } else{
          alert('input all')
      }
      
    }
    
    const betwin = async ()=>{
      if(isConnected){
        let tokenContract = new ethers.Contract(token, abi, signer);
        let allow =await tokenContract.allowance(address, index[0])
        if(parseInt(ethers.utils.formatEther(allow.toString())) < 100000){
          let tx =await tokenContract.approve(index[0], '100000000000000000000000000000000000')
          await tx.wait()
        }
        let nftContract = new ethers.Contract(index[0], nftabi, signer);
        let tx =await nftContract.bet(index[6])
        let rs = await tx.wait()
        if(rs.confirmations > 0){
          axios.post(`${serverURL}/bet`, {
            address: address,
            matchId: id, 
            teamId: index[6].toString(), 
            amount: index[3].toString()
          })
        }
      }else{
        alert("connect wallet")
      }
     
    }

    const betlose = async ()=>{
      let tokenContract = new ethers.Contract(token, abi, signer);
      let allow = await tokenContract.allowance(address, index[0])
      let tx
      console.log({
        ddress: address,
        matchId: id, 
        teamId: index[6].toString(), 
        amount: index[3].toString()})
      if(parseInt(ethers.utils.formatEther(allow.toString())) < 100000){
        tx =await tokenContract.approve(index[0], '100000000000000000000000000000000')
        await tx.wait()
      }
      let nftContract = new ethers.Contract(index[0], nftabi, signer);
      if(index[6].toString() == data.teams.home.id) {
        console.log(data.teams.away.id)
        tx = await nftContract.bet(data.teams.away.id)
        let rs = await tx.wait()
        if(rs.confirmations > 0){
          axios.post(`${serverURL}/bet`, {
            address: address,
            matchId: id, 
            teamId: data.teams.away.id, 
            amount: index[3].toString()
          })
        }
      }
      else{
        tx = await nftContract.bet(index[6])
        let rs = await tx.wait()
        if(rs.confirmations > 0){
          axios.post(`${serverURL}/bet`, {
            address: accounts[0],
            matchId: id, 
            teamId: index[6].toString(), 
            amount: index[3].toString()
          })
        }
      } 
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

    return(
        <div className="rightpadding">
            {data?
                <div className="resultCard mx-3">
                    <h1 className="title">
                        {data.league.name}:{data.league.country}
                    </h1>
                    <div className="row flex justify-center w-100">
                        <div className="col-4 col-md-3" style={{color:status2style(data.fixture.status.long)}}> 
                            { data.fixture.status.long}
                        </div>                        
                    </div>
                    <div className="row flex justify-center w-100">
                      {data.fixture.status.long == "Not Started" ?<div style={{color:"red"}}>{timedifference(data.fixture.timestamp)}</div> :<></>}
                    </div>
                    <br/>
                    <div className='mx-0 flex justify-center row teambigname'>
                      <div className='col-5 col-md-5'>
                        <img src={data.teams.home.logo} className="teambiglogo"></img>
                        <p>{data.teams.home.name}</p>
                      </div>
                      <div className='flex flex-col justify-center divider'>:</div>
                      <div className='col-5 col-md-5'>
                        <img src={data.teams.away.logo} className="teambiglogo"></img>
                        <p>{data.teams.away.name}</p>
                      </div>
                    </div>
                    <div className="row flex justify-center w-100 stadium">
                        <p className="stadium">{data.fixture.venue.name}&nbsp;&nbsp;&nbsp;{data.fixture.venue.city}</p>
                    </div>
                    {
                      data.fixture.status.long == "Match Finished"?
                      <div className='mx-0 flex justify-center row scorebig'>
                        <div className='col-5 col-md-5'>
                          {data.goals.home}
                        </div>
                        <div className='flex flex-col justify-center'>:</div>
                        <div className='col-5 col-md-5'>
                        {data.goals.away}
                        </div>
                      </div>  :<></>
                    }
                    <div className="py-1 px-3">
                        {
                        schedules.length != 0 ? 
                        <div className='flexwrap'>
                            {
                            schedules.map((item, key)=><div className='card' onClick={e=>handleClickOpen(key)}>
                                <div className='card-title'>{simpleaddress(item[0])}</div>
                                <div className='card-title'>Description: {item[2]}</div>
                                <div className='card-title'>{ethers.utils.formatEther(item[3].toString())}</div>
                            </div>)
                            }
                        </div>:
                        <></>
                        }
                    </div>
                </div>
            :
            <div></div>}

            <Dialog maxWidth='sm'  fullWidth={true} open={open} onClose={handleClose}>
              <DialogTitle style={{color:"white"}}>Create New Betting</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  <div className='column'>
                    <TextField InputLabelProps={{ shrink: true }} style={{color:"white"}} value={description} onChange={e=>setdescription(e.target.value)} autoFocus margin="dense" id="name" label="Bet description" variant="standard"/>
                    <TextField InputLabelProps={{ shrink: true }} style={{color:"white"}} value={amount} onChange={e=>setamount(e.target.value)} autoFocus margin="dense" id="name" label="Bet amount" variant="standard"/>
                  </div>
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                  <Button onClick={create}>Create</Button>
                  <Button onClick={handleClose}>Cancel</Button>
              </DialogActions>
            </Dialog>

            <Dialog open={openbet} onClose={handleClosebet}>
                <DialogTitle style={{color:"white"}}>Bet : {index[1]}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                    <Button variant="contained" onClick={betwin}>Bet on Win</Button>
                    &nbsp;
                    <Button variant="contained" onClick={betlose}>Bet on Lose</Button>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosebet}>Cancel</Button>
                </DialogActions>
            </Dialog>

            <Box sx={{ width: '100%', typography: 'body1' }}>
              <TabContext value={value1}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <TabList onChange={handleChange1} aria-label="lab API tabs example">
                    <Tab label="Item One" value="1" className="tabItem"/>
                    <Tab label="Item Two" value="2" className="tabItem"/>
                  </TabList>
                </Box>
                <TabPanel value="1">
                  <div className="flex flex-col">
                    <div>
                      <p style={{ textAlign: "start" }}>1x2</p>
                      <div className="flex flex-row justify-between" style={{ fontSize: "14px" }}>
                        <div className="btnDiv flex-auto" onClick={ e=>{setOpen(true); setValue(data.teams.home.id)} }>
                          <span style={{color: "rgb(115, 120, 131)", float: "left"}} >{data? data.teams.home.name: ""}</span>
                          <span style={{color: "white", float: "right"}}>{generateRandomDecimalInRangeFormatted(1, 99, 2)}</span>
                        </div>
                        <div className="btnDiv flex-auto">
                          <span style={{color: "rgb(115, 120, 131)", float: "left"}}>{"draw"}</span>
                          <span style={{color: "white", float: "right"}}>{generateRandomDecimalInRangeFormatted(1, 99, 2)}</span>
                        </div>
                        <div className="btnDiv flex-auto">
                          <span style={{color: "rgb(115, 120, 131)", float: "left"}}  onClick={e=>{setOpen(true); setValue(data.teams.away.id)} }>{data?data.teams.away.name:""}</span>
                          <span style={{color: "white", float: "right"}}>{generateRandomDecimalInRangeFormatted(1, 99, 2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <p style={{ textAlign: "start" }}>Total</p>
                      <div className="flex flex-row justify-between" style={{ fontSize: "14px" }}>
                        <div className="btnDiv flex-auto">
                          <span style={{color: "rgb(115, 120, 131)", float: "left"}}>{"over 5.5"}</span>
                          <span style={{color: "white", float: "right"}}>{generateRandomDecimalInRangeFormatted(1, 99, 2)}</span>
                        </div>
                        <div className="btnDiv flex-auto">
                          <span style={{color: "rgb(115, 120, 131)", float: "left"}}>{"under 5.5"}</span>
                          <span style={{color: "white", float: "right"}}>{generateRandomDecimalInRangeFormatted(1, 99, 2)}</span>
                        </div>
                      </div>
                      <div className="flex flex-row justify-between" style={{ fontSize: "14px" }}>
                        <div className="btnDiv flex-auto">
                          <span style={{color: "rgb(115, 120, 131)", float: "left"}}>{"over 6"}</span>
                          <span style={{color: "white", float: "right"}}>{generateRandomDecimalInRangeFormatted(1, 99, 2)}</span>
                        </div>
                        <div className="btnDiv flex-auto">
                          <span style={{color: "rgb(115, 120, 131)", float: "left"}}>{"under 6"}</span>
                          <span style={{color: "white", float: "right"}}>{generateRandomDecimalInRangeFormatted(1, 99, 2)}</span>
                        </div>
                      </div>
                      <div className="flex flex-row justify-between" style={{ fontSize: "14px" }}>
                        <div className="btnDiv flex-auto">
                          <span style={{color: "rgb(115, 120, 131)", float: "left"}}>{"over6.5"}</span>
                          <span style={{color: "white", float: "right"}}>{generateRandomDecimalInRangeFormatted(1, 99, 2)}</span>
                        </div>
                        <div className="btnDiv flex-auto">
                          <span style={{color: "rgb(115, 120, 131)", float: "left"}}>{"under 6.5"}</span>
                          <span style={{color: "white", float: "right"}}>{generateRandomDecimalInRangeFormatted(1, 99, 2)}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p style={{ textAlign: "start" }}>1x2</p>
                      <div className="flex flex-row justify-between" style={{ fontSize: "14px" }}>
                        <div className="btnDiv flex-auto">
                          <span style={{color: "rgb(115, 120, 131)", float: "left"}}>{data?data.teams.home.name:""}</span>
                          <span style={{color: "white", float: "right"}}>{generateRandomDecimalInRangeFormatted(1, 99, 2)}</span>
                        </div>
                        <div className="btnDiv flex-auto">
                          <span style={{color: "rgb(115, 120, 131)", float: "left"}}>{"none"}</span>
                          <span style={{color: "white", float: "right"}}>{generateRandomDecimalInRangeFormatted(1, 99, 2)}</span>
                        </div>
                        <div className="btnDiv flex-auto">
                          <span style={{color: "rgb(115, 120, 131)", float: "left"}}>{data?data.teams.away.name:""}</span>
                          <span style={{color: "white", float: "right"}}>{generateRandomDecimalInRangeFormatted(1, 99, 2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabPanel>
                <TabPanel value="2">Item Two</TabPanel>
              </TabContext>
            </Box>
        </div>
    )
}
export default Match;