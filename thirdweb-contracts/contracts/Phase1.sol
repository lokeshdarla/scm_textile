// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract Phase1 {
  // between farmers and mills

  uint256 private _rawMaterialIdCounter;
  uint256 private _farmerIdCounter;
  uint256 private _millIdCounter;
  uint256 private _fabricIdCounter;

    struct RawMaterial {
      uint256 id;
      uint256 farmerId;
      string materialType;
      uint256 quantity;
      uint256 price;
      string location;
      bool isAvailable;
    }

    struct Fabric {
      uint256 id;
      uint256 millId;
      uint256 rawMaterialId;
      uint256 quantity;
      string location;
      bool isAvailable;
    }

    struct User {
      uint256 id;
      string name;
      string role;
      string location;
    }

    mapping(uint256 => RawMaterial) private rawMaterials;
    mapping(uint256 => RawMaterial[]) private farmerRawMaterials;
    mapping(uint256 => Fabric) private fabrics;
    mapping(uint256 => Fabric[]) private millFabrics;
    mapping(address => uint256) private userAddressToFarmerId;
    mapping(address => uint256) private userAddressToMillId;
    mapping(address => User) private userDetails;
    mapping(address => string) private userRoles;
    mapping(uint256 => address) private FarmerIdToAddress;
    mapping(uint256 => address) private MillIdToAddress;

    event RawMaterialAdded(uint256 indexed materialId, string materialType);
    event FarmerRegistered(uint256 indexed userId, address indexed userAddress, string name, string role, string location);
    event MillRegistered(uint256 indexed userId, address indexed userAddress, string name, string role, string location);
    event FabricAdded(uint256 indexed fabricId, uint256 rawMaterialId, uint256 quantity, string location);


    function registerUser(string memory _name, string memory _role, string memory _location) external returns (uint256) {
      require(userAddressToFarmerId[msg.sender] == 0, "User already registered");

      _farmerIdCounter++;
      FarmerIdToAddress[_farmerIdCounter] = msg.sender;
      userAddressToFarmerId[msg.sender] = _farmerIdCounter;

      userDetails[msg.sender] = User({
        id: _farmerIdCounter,
        name: _name,
        role: _role,
        location: _location
      });

      userRoles[msg.sender] = "farmer";

      emit FarmerRegistered(_farmerIdCounter, msg.sender, _name, _role, _location);
      return _farmerIdCounter;
    }

    function addRawMaterial(
        string memory _materialType,
        uint256 _farmerId,
        uint256 _quantity,
        uint256 _price,
        string memory _location
    ) external returns (uint256) {
      require(keccak256(bytes(userRoles[msg.sender])) == keccak256(bytes("farmer")), "Only farmers can add raw materials");

      _rawMaterialIdCounter++;
      rawMaterials[_rawMaterialIdCounter] = RawMaterial({
        id: _rawMaterialIdCounter,
        farmerId: _farmerId,
        materialType: _materialType,
        quantity: _quantity,
        price: _price,
        location: _location,
        isAvailable: true
      });

      farmerRawMaterials[_farmerId].push(rawMaterials[_rawMaterialIdCounter]);

      emit RawMaterialAdded(_rawMaterialIdCounter, _materialType);
      return _rawMaterialIdCounter;
    }


    function registerMill(string memory _name, string memory _role, string memory _location) external returns (uint256) {
      require(userAddressToMillId[msg.sender] == 0, "User already registered");

      _millIdCounter++;
      MillIdToAddress[_millIdCounter] = msg.sender;
      userAddressToMillId[msg.sender] = _millIdCounter;

      userDetails[msg.sender] = User({
        id: _millIdCounter,
        name: _name,
        role: _role,
        location: _location
      });

      emit MillRegistered(_millIdCounter, msg.sender, _name, _role, _location);
      return _millIdCounter;
    }

    function addFabric(
        uint256 _millId,
        uint256 _rawMaterialId,
        uint256 _quantity,
        string memory _location
    ) external returns (uint256) {
      require(keccak256(bytes(userRoles[msg.sender])) == keccak256(bytes("mill")), "Only mills can add fabrics");

      rawMaterials[_rawMaterialId].isAvailable = false;
      _fabricIdCounter++;

      fabrics[_fabricIdCounter] = Fabric({
        id: _fabricIdCounter,
        millId: _millId,
        rawMaterialId: _rawMaterialId,
        quantity: _quantity,
        location: _location,
        isAvailable: true
      });

      millFabrics[_millId].push(fabrics[_fabricIdCounter]);


      emit FabricAdded(_fabricIdCounter, _rawMaterialId, _quantity, _location);

      return _fabricIdCounter;


    }
    
}
