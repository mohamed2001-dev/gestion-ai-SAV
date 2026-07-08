import React from 'react'
import { useNavigate } from "react-router-dom";

function TechnicianDashboard() {
    const navigate = useNavigate()
    const handelClick = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
    }
    return (
        <div>
            Technician
            <button className='bg-red-600 cursor-pointer'
                    onClick={handelClick}>Logout</button>
        </div>
    )
}

export default TechnicianDashboard
