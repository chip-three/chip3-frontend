import { useEffect, useState } from "react";
import axios from 'axios'
import { serverURL , status2style} from "./App";
import { useNavigate } from "react-router-dom";
import mockdata from './hisotry.json';

import { RiWirelessChargingFill } from 'react-icons/ri';
import { GiSoccerBall } from 'react-icons/gi';
import { TbAntennaBars4 } from 'react-icons/tb';

function AllBets() {
    const [history, sethistory] = useState([])
    const navigate = useNavigate();

    useEffect(()=>{
        sethistory(mockdata)
    },[])
    
    const gethistory =async () =>{
        //   const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        // if(accounts){
        //   let res = await axios.post(`${serverURL}/history`,{
        //     address: accounts[0]
        //   })
        //   console.log(res.data)
        //   sethistory(res.data)
        // }
        sethistory(mockdata)
    }

    function generateRandomDecimalInRangeFormatted(min, max, places) {
        let value = (Math.random() * (max - min + 1)) + min;
        return Number.parseFloat(value).toFixed(places);
      }

    function getcoinbalance(wei){
        console.log(typeof(wei))
        if(wei)
          return wei.slice(0, wei.length - 18 )
      }

    const redirect = (key) =>{
        console.log(history[key])
    }

    return(
        <div className='w-100'>
             <div className="list">
                {
                history.length != 0 ? history.map((item, key)=>
                <div className="d-flex flex-column matche_card" key={key} onClick={e=>redirect(key)}>
                    <div className="d-flex flex-row justify-content-between" style={{ fontSize: "11px", marginBottom: "5px" }}>
                        <div style={{ color: "rgb(115, 120, 131)" }}><GiSoccerBall /> {item[0].data.league.name}-{item[0].data.league.country}</div>
                        <span style={{color: "rgb(115, 120, 131)"}}><TbAntennaBars4 /></span>
                    </div>
                    <div className="d-flex flex-row justify-content-between" style={{ fontSize: "11px", marginBottom: "5px" }}>
                        <div style={{ color: "yellow" }}>{item[0].data.fixture.status.long}</div>
                        <span style={{color: "red", fontSize: "13px"}}><RiWirelessChargingFill /></span>
                    </div>
                    <div className="d-flex flex-row justify-content-between" style={{ fontSize: "14px" }}>
                        <div style={{ width: "180px" }}>
                        <img src={item[0].data.teams.home.logo} className="teamlogo"></img>
                        <p style={{ display: "line", float: "left", marginLeft: "10px"}}>{item[0].data.teams.home.name}</p>
                        </div>
                        <div className="goalNum">{item[0].data.goals.home}</div>
                    </div>
                    <div className="d-flex flex-row justify-content-between" style={{ fontSize: "14px" }}>
                        <div style={{ width: "180px" }}>
                        <img src={item[0].data.teams.away.logo} className="teamlogo"></img>
                        <p style={{ display: "line", float: "left", marginLeft: "10px"}}>{item[0].data.teams.away.name}</p>
                        </div>
                        <div className="goalNum">{item[0].data.goals.away}</div>
                    </div>
                    <div className="d-flex flex-row justify-content-between" style={{ fontSize: "14px", marginBottom: "5px" }}>
                        <span style={{ color: "rgb(115, 120, 131)", fontSize: "11px"}}>1x2</span>
                    </div>
                    <div className="d-flex flex-row justify-content-between" style={{ fontSize: "14px" }}>
                        <div className="btnDiv flex-fill">
                        <span style={{color: "rgb(115, 120, 131)", float: "left"}}>{item[0].data.teams.home.name}</span>
                        <span style={{color: "white", float: "right"}}>{generateRandomDecimalInRangeFormatted(1, 99, 2)}</span>
                        </div>
                        <div className="btnDiv flex-fill">
                        <span style={{color: "rgb(115, 120, 131)", float: "left"}}>{item[0].data.teams.away.name}</span>
                        <span style={{color: "white", float: "right"}}>{generateRandomDecimalInRangeFormatted(1, 99, 2)}</span>
                        </div>
                    </div>
                    <div style={{color:"white", fontSize:"13px"}}>
                            Betting amount:{getcoinbalance(item[1].amount)?getcoinbalance(item[1].amount):150}
                    </div>
                    </div>):<></>
                    }
                </div>
        </div>
    )
}

export default AllBets;