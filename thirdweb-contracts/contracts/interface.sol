// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "./Phase1.sol";

contract SupplyChainIterface {
    Phase1 private phase1 = Phase1(phase1address);
    // uint private _rawMaterialIdCounter;
    uint private _userIdCounter;

    // constructor(address _phase1Address) {
    //   phase1 = Phase1(_phase1Address);
    // }

    // mapping(uint256 => RawMaterial) private rawMaterials;
    mapping(address => string) private userRoles;
    

    struct User {
        uint256 id;
        string name;
        string role;
        string location;
    }



}
