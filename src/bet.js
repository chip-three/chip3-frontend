import {useParams} from "react-router-dom";
import { useEffect, useState } from "react";
import { ethers } from 'ethers';
import factoryabi from './factory.json'
import cn from "classnames"
import { menustatu, coinbalance } from './atom'
import { useAtom } from 'jotai'
import axios from 'axios'
import { serverURL , status2style} from "./App";
import {
    useAccount,
    useSigner 
} from "wagmi";

import nftabi from './erc1155.json'

const factory = "0xBf1cc2806d3506a6118Ca3308492a7cAA465Fdb7"
const token = "0x6b15be00DBb3c2ffB808f40C1782F8EA83132afe"

const abi = require('erc-20-abi')

function Bet() {
    const {id, id1} = useParams();
    const [data, setdata] = useState()
    const [matchdata, setmatchdata] = useState()
    const {  isConnected , address} = useAccount()
    const [showrightbar, setshowrightbar] = useAtom(menustatu)
    const { data: signer, isError, isLoading } = useSigner()
    const [balance, setBalance] = useAtom(coinbalance)

    useEffect(()=>{
        axios.post( `${serverURL}/get_data_id`, {
        id:id
        }).then(res=>{
            console.log(res.data[0].data)
            setmatchdata(res.data[0].data)
        })

        let provider = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com/')
        let vestingcontract = new ethers.Contract(factory, factoryabi, provider);
        vestingcontract.getMyContract(id)
        .then(result=>{
            setdata(result[id1])
            console.log(result)
        })
      },[])

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

    const bignumberToint = (bignumber) => {
        return bignumber.toString()
    }

    const betwin = async ()=>{
        if(isConnected){
          let tokenContract = new ethers.Contract(token, abi, signer);
          let allow = await tokenContract.allowance(address, data[0])
  
          if(parseInt(ethers.utils.formatEther(allow.toString())) < 100000){
            let tx =await tokenContract.approve(data[0], '100000000000000000000000000000000000')
            await tx.wait()
          }
          let nftContract = new ethers.Contract(data[0], nftabi, signer);
          let tx =await nftContract.bet(data[6])
          let rs = await tx.wait()
  
          tokenContract.balanceOf(address).then(res=>{
            setBalance(ethers.utils.formatEther(res.toString()).split('.')[0])
          })
  
          if(rs.confirmations > 0){
            axios.post(`${serverURL}/bet`, {
              address: address,
              matchId: id, 
              teamId: data[6].toString(), 
              amount: data[3].toString()
            })
          }
        }else{
          alert("connect wallet")
        }
       
      }
  
      const betlose = async ()=>{
        let tokenContract = new ethers.Contract(token, abi, signer);
        let allow = await tokenContract.allowance(address, data[0])
        let tx
        if(parseInt(ethers.utils.formatEther(allow.toString())) < 100000){
          tx =await tokenContract.approve(data[0], '100000000000000000000000000000000')
          await tx.wait()
        }
        let nftContract = new ethers.Contract(data[0], nftabi, signer);
        if(data[6].toString() == data.teams.home.id) {
          console.log(data.teams.away.id)
          tx = await nftContract.bet(data.teams.away.id)
          let rs = await tx.wait()
          tokenContract.balanceOf(address).then(res=>{
            setBalance(ethers.utils.formatEther(res.toString()).split('.')[0])
          })
          if(rs.confirmations > 0){
            axios.post(`${serverURL}/bet`, {
              address: address,
              matchId: id, 
              teamId: data.teams.away.id, 
              amount: data[3].toString()
            })
          }
        }
        else{
          tx = await nftContract.bet(data[6])
          let rs = await tx.wait()
          tokenContract.balanceOf(address).then(res=>{
            setBalance(ethers.utils.formatEther(res.toString()).split('.')[0])
          })
          if(rs.confirmations > 0){
            axios.post(`${serverURL}/bet`, {
              address: address,
              matchId: id, 
              teamId: data[6].toString(), 
              amount: data[3].toString()
            })
          }
        } 
      }
      const share = () =>{
        navigator.clipboard.writeText(window.location.href)
      }

    return(
        <div className={cn('rightpadding', !showrightbar && 'nopadding')}>
            {matchdata ?
            <div className="mt-[10px] resultCard mx-3">
                <h1 className="title flex flex-row text-[30px]">
                    <div class="basis-2/5 text-center">{matchdata.league.name}</div>
                    <div class="basis-1/5 text-center">:</div>
                    <div class="basis-2/5 text-center"> {matchdata.league.country}</div>
                </h1>
                <div className="row flex justify-center w-full">
                    <div className="text-[20px]" style={{color:status2style(matchdata.fixture.status.long)}}> 
                        { matchdata.fixture.status.long}
                    </div>                        
                </div>
                <div className="row flex justify-center w-full text-[20px]">
                    {matchdata.fixture.status.long == "Not Started" ?<div style={{color:"red"}}>{timedifference(matchdata.fixture.timestamp)}</div> :<></>}
                </div>
                <br/>
                <div className='mx-0 flex justify-around flex-row w-full teambigname'>
                    <div className='basis-4/9 justify-center'>
                    <img src={matchdata.teams.home.logo} className="teambiglogo"></img>
                    <p>{matchdata.teams.home.name}</p>
                    </div>
                    <div className='basis-1/9 flex flex-col justify-between divider'>:</div>
                    <div className='basis-4/9 justify-center'>
                    <img src={matchdata.teams.away.logo} className="teambiglogo"></img>
                    <p>{matchdata.teams.away.name}</p>
                    </div>
                </div>
                <div className="row flex justify-center w-100 stadium">
                    <p className="stadium">{matchdata.fixture.venue.name}&nbsp;&nbsp;&nbsp;{matchdata.fixture.venue.city}</p>
                </div>
                {
                    matchdata.fixture.status.long == "Match Finished"?
                    <div className='mx-0 flex justify-center row scorebig'>
                    <div className='col-5 col-md-5'>
                        {matchdata.goals.home}
                    </div>
                    <div className='flex flex-col justify-center'>:</div>
                    <div className='col-5 col-md-5'>
                    {matchdata.goals.away}
                    </div>
                    </div>  :<></>
                }
 
            </div>
            :
            <div></div>}

            {
                data && matchdata &&
                <div>
                    { 
                        bignumberToint(data[6]) == matchdata.teams.away.id?
                        <div> { matchdata.teams.away.name} is win <br/>(betamount is {bignumberToint(data[3])} CHIP3) </div>:
                        <div> { matchdata.teams.home.name} is win <br/>(betamount is {bignumberToint(data[3])} CHIP3)</div>
                    }
                    <div className="flex mt-[20px] space-x-4 justify-center">
                        <label onClick={e=>share()} className="btn">Share my bet</label>
                        <label onClick={e=>betwin()} className="btn">Bet on Win</label>
                        <label onClick={e=>betlose()} className="btn">Bet on Lose</label>
                    </div>
                </div>
            }
        </div>
    )
}

export default Bet;