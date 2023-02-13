import { useEffect, useState } from "react";
import axios from 'axios'
import { serverURL , status2style} from "./App";
import { useNavigate } from "react-router-dom";

function History() {

    const [history, sethistory] = useState([])
    const navigate = useNavigate();

    useEffect(()=>{
        gethistory()
    },[])

    const gethistory =async () =>{
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if(accounts){
        let res = await axios.post(`${serverURL}/history`,{
          address: accounts[0]
        })
        console.log(res.data)
        sethistory(res.data)
      }
    }

    const timestamp2time = (timestamp)=>{
        let yourDate = new Date(timestamp * 1000)
        return yourDate.toISOString().split('T')[0] + "  " + yourDate.toISOString().split('T')[1]
    }

    const redirect = (key) =>{
        console.log(history[key])

        navigate("/" + history[key][0].data.fixture.id)
    }

    function getcoinbalance(wei){
        console.log(typeof(wei))
        if(wei)
          return wei.slice(0, wei.length - 18 )
      }

    return(<div className='w-75'>
    <h2 className='title'>Your betting</h2>
    {
      history.length !=0 ? history.map((item, key)=>
        <div className='matche_card' key={key} onClick={e=>redirect(key)}>
            <div className='mx-0 d-flex justify-content-between row leaguename'>
                <div className='col-5 col-md-5'>
                {item[0].data.league.name}-{item[0].data.league.country}
                </div>
                <div className='col-5 col-md-5' style={{color:status2style(item[0].data.fixture.status.long)}}>
                {item[0].data.fixture.status.long}
                </div>
            </div>
            <div className='mx-0 d-flex justify-content-center row starttime'>
                {timestamp2time(item[0].data.fixture.timestamp)}
            </div>
            <div className='mx-0 d-flex justify-content-center row teamname'>
                <div className='col-5 col-md-5'>
                <img src={item[0].data.teams.home.logo} className="teamlogo"></img>
                <p>{item[0].data.teams.home.name}</p>
                </div>
                <div className='d-flex flex-column justify-content-center'>:</div>
                <div className='col-5 col-md-5'>
                <img src={item[0].data.teams.away.logo} className="teamlogo"></img>
                <p>{item[0].data.teams.away.name}</p>
                </div>
            </div>
            {
                item[0].data.fixture.status.long == "Match Finished"?
                <div className='mx-0 d-flex justify-content-center row score'>
                <div className='col-5 col-md-5'>
                    {item[0].data.goals.home}
                </div>
                <div className='d-flex flex-column justify-content-center'>:</div>
                <div className='col-5 col-md-5'>
                {item[0].data.goals.away}
                </div>
                </div>  :<></>
            }
            <div style={{color:"blue", fontSize:"13px"}}>
                Betting amount:{getcoinbalance(item[1].amount)}
            </div>
        </div>
      ):<></>
    }
  </div>)
}

export default History;