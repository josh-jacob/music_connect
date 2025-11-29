import React from "react";
import {Outlet} from "react-router-dom";

const PrivateRoute = () => {
    /* const user;  call userSlice auth endpoint
    if (!user.token) return <Navigate to="/login" />;
     */
    return <Outlet />;
};

export default PrivateRoute;