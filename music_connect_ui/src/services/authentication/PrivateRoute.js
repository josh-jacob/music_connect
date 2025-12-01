import React from "react";
import {Outlet} from "react-router-dom";
import {Navigate} from "react-router";

const PrivateRoute = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return <Navigate to="/login" />;
    return <Outlet />;
};

export default PrivateRoute;