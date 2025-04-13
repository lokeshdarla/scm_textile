// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.0;

// contract SupplyChainPhase1 {
//   enum UserRole {
//     Farmer,
//     Mill,
//     Manufacturer,
//     None
//   }

//   address private admin;

//   uint256 private _rawMaterialIdCounter;
//   uint256 private _fabricIdCounter;
//   uint256 private _productIdCounter;
//   uint256 private _millIdCounter;
//   uint256 private _farmerIdCounter;
//   uint256 private _manufacturerIdCounter;

//     struct RawMaterial {
//       uint256 id;
//       uint256 farmerId;
//       string materialType;
//       uint256 quantity;
//       uint256 price;
//       string location;
//       bool isAvailable;
//     }

//     struct Fabric {
//       uint256 id;
//       uint256 millId;
//       uint256 rawMaterialId;
//       uint256 quantity;
//       string location;
//       bool isAvailable;
//     }

//     struct Product {
//       uint256 id;
//       uint256 manufacturerId;
//       uint256 fabricId;
//       string productType;
//       uint256 quantity;
//       uint256 price;
//       string location;
//       bool isAvailable;
//     }

//     struct User {
//       uint256 id;
//       string name;
//       UserRole role;
//       string _role;
//       string location;
//     }

//     mapping(uint256 => RawMaterial) private rawMaterials;
//     mapping(uint256 => RawMaterial[]) private farmerRawMaterials;
//     mapping(uint256 => Fabric) private fabrics;
//     mapping(uint256 => Fabric[]) private millFabrics;
//     mapping(uint256 => Product) private products;
//     mapping(uint256 => Product[]) private manufacturerProducts;
//     mapping(address => uint256) private userAddressToFarmerId;
//     mapping(address => uint256) private userAddressToMillId;
//     mapping(address => uint256) private userAddressToManufacturerId;
//     mapping(address => User) private userDetails;
//     mapping(address => UserRole) private userRoles;
//     mapping(uint256 => address) private FarmerIdToAddress;
//     mapping(uint256 => address) private MillIdToAddress;
//     mapping(uint256 => address) private ManufacturerIdToAddress;

//     event RawMaterialAdded(uint256 indexed materialId, string materialType);
//     event UserRegistered(uint256 indexed userId, address indexed userAddress, string name, UserRole role, string location);
//     event FabricAdded(uint256 indexed fabricId, uint256 rawMaterialId, uint256 quantity, string location);
//     event ProductAdded(uint256 indexed productId, uint256 fabricId, string productType, uint256 quantity, string location);

//     modifier onlyNewUser() {
//       require(userDetails[msg.sender].id ==0 , "user already registered");
//       _;
//     }

//     modifier onlyFarmer() {
//         require(userRoles[msg.sender] == UserRole.Farmer, "Only Farmers allowed");
//         _;
//     }

//     modifier onlyMill() {
//         require(userRoles[msg.sender] == UserRole.Mill, "Only Mills allowed");
//         _;
//     }

//     modifier onlyManufacturer() {
//         require(userRoles[msg.sender] == UserRole.Manufacturer, "Only Manufacturers allowed");
//         _;
//     }

//     // helpers
//     function stringToUserRole(string memory role) public pure returns (UserRole) {
//         if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("Farmer"))) {
//             return UserRole.Farmer;
//         } else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("Mill"))) {
//             return UserRole.Mill;
//         } else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("Manufacturer"))) {
//             return UserRole.Manufacturer;
//         } else {
//             return UserRole.None; 
//         }
//     }

//     //users
//     function registerUser(
//         string memory _name,
//         string memory _location,
//         string memory _role
//     ) external onlyNewUser returns (uint256 id) {
//         UserRole role = stringToUserRole(_role);
//         require(role == UserRole.Farmer || role == UserRole.Mill || role == UserRole.Manufacturer, "Invalid role");

//         if (role == UserRole.Farmer) {
//             require(userAddressToFarmerId[msg.sender] == 0, "User already registered as farmer");
//             _farmerIdCounter++;
//             FarmerIdToAddress[_farmerIdCounter] = msg.sender;
//             userAddressToFarmerId[msg.sender] = _farmerIdCounter;

//             userDetails[msg.sender] = User({
//                 id: _farmerIdCounter,
//                 name: _name,
//                 role: UserRole.Farmer,
//                 _role: _role,
//                 location: _location
//             });
            
//             userRoles[msg.sender] = UserRole.Farmer;
//             emit UserRegistered(_farmerIdCounter, msg.sender, _name, UserRole.Farmer, _location);
//             return _farmerIdCounter;
//         } else if(role == UserRole.Mill) {
//             require(userAddressToMillId[msg.sender] == 0, "User already registered as mill");
//             _millIdCounter++; 
//             MillIdToAddress[_millIdCounter] = msg.sender;
//             userAddressToMillId[msg.sender] = _millIdCounter;
            
//             userDetails[msg.sender] = User({
//                 id: _millIdCounter,
//                 name: _name,
//                 role: UserRole.Mill,
//                 _role: _role,
//                 location: _location
//             });
            
//             userRoles[msg.sender] = UserRole.Mill;
//             emit UserRegistered(_millIdCounter, msg.sender, _name, UserRole.Mill, _location);
//             return _millIdCounter;
//         } else if(role == UserRole.Manufacturer) {
//             require(userAddressToManufacturerId[msg.sender] == 0, "User already registered as manufacturer");
//             _manufacturerIdCounter++;
//             ManufacturerIdToAddress[_manufacturerIdCounter] = msg.sender;
//             userAddressToManufacturerId[msg.sender] = _manufacturerIdCounter;
            
//             userDetails[msg.sender] = User({
//                 id: _manufacturerIdCounter,
//                 name: _name,
//                 role: UserRole.Manufacturer,
//                 _role: _role,
//                 location: _location
//             });
            
//             userRoles[msg.sender] = UserRole.Manufacturer;
//             emit UserRegistered(_manufacturerIdCounter, msg.sender, _name, UserRole.Manufacturer, _location);
//             return _manufacturerIdCounter;
//         }
//     }

//     function getUserDetails() external view returns (User memory user)
//     {
//       user = userDetails[msg.sender];
//       require(user.role != UserRole.None, "User not registered");
//       return user;
//     }

//     //farmers
//     function addRawMaterial(
//         string memory _materialType,
//         uint256 _quantity,
//         uint256 _price,
//         string memory _location
//     ) external returns (uint256) {
//       require(userRoles[msg.sender] == UserRole.Farmer, "Only farmers can add raw materials");

//       uint256 _farmerId = userAddressToFarmerId[msg.sender];

//       _rawMaterialIdCounter++;
//       rawMaterials[_rawMaterialIdCounter] = RawMaterial({
//         id: _rawMaterialIdCounter,
//         farmerId: _farmerId,
//         materialType: _materialType,
//         quantity: _quantity,
//         price: _price,
//         location: _location,
//         isAvailable: true
//       });

//       farmerRawMaterials[_farmerId].push(rawMaterials[_rawMaterialIdCounter]);

//       emit RawMaterialAdded(_rawMaterialIdCounter, _materialType);
//       return _rawMaterialIdCounter;
//     }

//     function getRawMaterial(uint256 _rawMaterialId) external view onlyFarmer returns (RawMaterial memory) {
//       return rawMaterials[_rawMaterialId];
//     }

//     function getAllRawMaterials() external view onlyFarmer returns (RawMaterial[] memory rawMaterialss) {
//       uint256 _farmerId = userAddressToFarmerId[msg.sender];
//       rawMaterialss = farmerRawMaterials[_farmerId];
//       require(rawMaterialss.length > 0, "No raw materials found");
//       return rawMaterialss;
//     }

//     //mills
//     function addFabric(
//         uint256 _rawMaterialId,
//         uint256 _quantity,
//         string memory _location
//     ) external onlyMill returns (uint256) {
//       require(userRoles[msg.sender] == UserRole.Mill, "Only mills can add fabrics");

//       uint256 _millId = userAddressToMillId[msg.sender];

//       rawMaterials[_rawMaterialId].isAvailable = false;
//       _fabricIdCounter++;

//       fabrics[_fabricIdCounter] = Fabric({
//         id: _fabricIdCounter,
//         millId: _millId,
//         rawMaterialId: _rawMaterialId,
//         quantity: _quantity,
//         location: _location,
//         isAvailable: true
//       });

//       millFabrics[_millId].push(fabrics[_fabricIdCounter]);

//       emit FabricAdded(_fabricIdCounter, _rawMaterialId, _quantity, _location);
//       return _fabricIdCounter;
//     }

//     function getFabric(uint256 _fabricId) external view onlyMill returns (Fabric memory fabric) {
//       fabric = fabrics[_fabricId];
//       require(fabric.isAvailable, "Fabric not available");
//       return fabric;
//     }

//     function getAllFabrics() external view onlyMill returns (Fabric[] memory fabricss) {
//       uint256 _millId = userAddressToMillId[msg.sender];
//       fabricss = millFabrics[_millId];
//       require(fabricss.length > 0, "No fabrics found");
//       return fabricss;
//     }

//     //manufacturers
//     function addProduct(
//         uint256 _fabricId,
//         string memory _productType,
//         uint256 _quantity,
//         uint256 _price,
//         string memory _location
//     ) external onlyManufacturer returns (uint256) {
//       require(userRoles[msg.sender] == UserRole.Manufacturer, "Only manufacturers can add products");
//       require(fabrics[_fabricId].isAvailable, "Fabric not available");

//       uint256 _manufacturerId = userAddressToManufacturerId[msg.sender];

//       fabrics[_fabricId].isAvailable = false;
//       _productIdCounter++;

//       products[_productIdCounter] = Product({
//         id: _productIdCounter,
//         manufacturerId: _manufacturerId,
//         fabricId: _fabricId,
//         productType: _productType,
//         quantity: _quantity,
//         price: _price,
//         location: _location,
//         isAvailable: true
//       });

//       manufacturerProducts[_manufacturerId].push(products[_productIdCounter]);

//       emit ProductAdded(_productIdCounter, _fabricId, _productType, _quantity, _location);
//       return _productIdCounter;
//     }

//     function getProduct(uint256 _productId) external view onlyManufacturer returns (Product memory product) {
//       product = products[_productId];
//       require(product.isAvailable, "Product not available");
//       return product;
//     }

//     function getAllProducts() external view onlyManufacturer returns (Product[] memory productss) {
//       uint256 _manufacturerId = userAddressToManufacturerId[msg.sender];
//       productss = manufacturerProducts[_manufacturerId];
//       require(productss.length > 0, "No products found");
//       return productss;
//     }
// } 
