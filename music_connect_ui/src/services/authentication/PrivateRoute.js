import React from "react";
import {Outlet} from "react-router-dom";
import {Navigate} from "react-router";
import {useSelector} from "react-redux";

const PrivateRoute = () => {
    const user = useSelector((state) => state.users.user);  // call userSlice auth endpoint
    if (!user.token) return <Navigate to="/login" />;
    return <Outlet />;
};

export default PrivateRoute;