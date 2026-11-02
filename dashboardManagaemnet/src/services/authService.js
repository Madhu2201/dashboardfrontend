import api from "./api";

export const login =  (email,password) =>{
    return api.post("/login",{email,password})

}
export const register = (name,email,password,role)=>{
    return api.post("/register",{name,email,password,role})
}


