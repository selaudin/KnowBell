import { styled } from "styled-components";
import { Link } from "react-router-dom";

export const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 20px;
  /*padding: 20px 25px;*/
  color: white;
  text-decoration: none;
  transition: all 0.2s;
`;

export const TeamLogo = styled.div`
  font-size: 22px;
  margin: 0 10px;
  color: white;
  text-align: center;
  padding: 20px;
`;
