import { findUserById } from "../models/user.js";
export const getUserDataService = async (id) =>{
    const userData = await findUserById(id)
    delete userData.password
    return userData
}