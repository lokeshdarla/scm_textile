// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract SimpleTextileSupplyChainPhase1 {

    uint256 private _rawMaterialIdCounter;
    uint256 private _userIdCounter;
    
    mapping(uint256 => RawMaterial) public rawMaterials;
    mapping(address => uint256) public userAddressToId;
    mapping(address => string) public userRoles;
    mapping(uint256 => User) public users;
    
    struct RawMaterial {
        uint256 id;
        string materialType;
        uint256 quantity;
        uint256 price;
        string location;
        bool isAvailable;
    }

    struct User {
        uint256 id;
        string name;
        string role;
        string location;
    }

    event RawMaterialAdded(uint256 indexed materialId, string materialType);
    event UserRegistered(uint256 indexed userId, address indexed userAddress, string name, string role, string location);

    function registerUser(string memory _name, string memory _role, string memory _location) external returns (uint256) {
        require(userAddressToId[msg.sender] == 0, "User already registered");

        _userIdCounter++;
        uint256 newUserId = _userIdCounter;
        
        userAddressToId[msg.sender] = newUserId;
        userRoles[msg.sender] = _role;
        
        users[newUserId] = User({
            id: newUserId,
            name: _name,
            role: _role,
            location: _location
        });

        emit UserRegistered(newUserId, msg.sender, _name, _role, _location);
        return newUserId;
    }

    function addRawMaterial(
        string memory _materialType,
        uint256 _quantity,
        uint256 _price,
        string memory _location
    ) external returns (uint256) {
        require(keccak256(bytes(userRoles[msg.sender])) == keccak256(bytes("FARMER_ROLE")), "Only farmers can add raw materials");

        _rawMaterialIdCounter++;
        uint256 newMaterialId = _rawMaterialIdCounter;

        rawMaterials[newMaterialId] = RawMaterial({
            id: newMaterialId,
            materialType: _materialType,
            quantity: _quantity,
            price: _price,
            location: _location,
            isAvailable: true
        });

        emit RawMaterialAdded(newMaterialId, _materialType);
        return newMaterialId;
    }

    function getRawMaterial(uint256 _materialId) external view returns (RawMaterial memory) {
        return rawMaterials[_materialId];
    }
}
