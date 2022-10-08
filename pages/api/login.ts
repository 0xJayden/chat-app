import { NextApiRequest, NextApiResponse } from "next";
import argon2 from "argon2";
import crypto from "crypto";
import { query, collection, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../firebase.config";
import jwt from "jsonwebtoken";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  //   const { username, password, hashpw, userId } = req.body;

  //   const isPasswordCorrect = await argon2.verify(hashpw, password);

  //   if (!isPasswordCorrect) return;

  //   const user = { username, password, userId };

  //   const tokenUser = createTokenUser(user);

  //   let refreshToken = "";

  //   const q = query(collection(db, "tokens"), where("userId", "==", userId));

  //   const querySnapshot = await getDocs(q);

  //   querySnapshot.forEach((doc) => {
  //     const tokenData = doc.data();

  //     if (!tokenData.isValid) return console.log("token not valid");
  //     refreshToken = tokenData.refreshToken;
  //     attachCookiesToResponse({ res, user: tokenUser, refreshToken });
  //     res.status(200).json({ user: tokenUser });
  //     return;
  //   });

  //   refreshToken = crypto.randomBytes(40).toString("hex");
  //   const userAgent = req.headers["user-agent"];
  //   const ip = req.socket.remoteAddress;
  //   const isValid = true;
  //   const userToken = { refreshToken, ip, isValid, userAgent, user: userId };

  //   await addDoc(collection(db, "tokens"), userToken);

  //   attachCookiesToResponse({ res, user: tokenUser, refreshToken });
  console.log(res.getHeaders());
  res.status(200).json({ user: "tokenUser" });
};

const createTokenUser = (user) => {
  return { username: user.username, userId: user.userId };
};

const attachCookiesToResponse = ({ res, user, refreshToken }) => {
  const accessTokenJWT = createJWT({ payload: { user } });
  const refreshTokenJWT = createJWT({ payload: { user, refreshToken } });

  const oneDay = 1000 * 60 * 60 * 24;
  const thirtyDay = 1000 * 60 * 60 * 24 * 30;

  res.cookies("accessToken", accessTokenJWT, {
    httpOnly: true,
    secure: true,
    signed: true,
    expires: new Date(Date.now() + oneDay),
  });

  res.cookies("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    secure: true,
    signed: true,
    expires: new Date(Date.now() + thirtyDay),
  });
};

const createJWT = ({ payload }) => {
  const token = jwt.sign(payload, "longstring");
  return token;
};

export default handler;
