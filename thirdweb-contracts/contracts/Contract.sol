// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TextileSupplyChainV4 {
    // Role definitions
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant MILL_ROLE = keccak256("MILL_ROLE");
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant CUSTOMER_ROLE = keccak256("CUSTOMER_ROLE");

    // Role management
    mapping(address => mapping(bytes32 => bool)) private _roles;
    
    // User information
    struct UserInfo {
        string name;
        string role;
        string location;
        uint256 registrationDate;
    }
    mapping(address => UserInfo) public users;

    // Product counters
    uint256 private _rawMaterialIds;
    uint256 private _fabricIds;
    uint256 private _apparelIds;
    uint256 private _packagedStockIds;
    uint256 private _retailProductIds;

    // Product structs - Simplified
    struct RawMaterial {
        uint256 id;
        address farmer;
        address mill;
        string qrCode;
        bool isAvailable;
        uint256 timestamp;
        string name;
        string rawMaterialType;
        uint256 quantity;
        uint256 price;
        bool isUsedForFabric;
    }

    struct Fabric {
        uint256 id;
        address mill;
        address manufacturer;
        string qrCode;
        uint256[] rawMaterialIds;
        bool isAvailable;
        uint256 timestamp;
        string name;
        string composition;
        uint256 price;
        bool isUsedForApparel;
    }

    struct Apparel {
        uint256 id;
        address manufacturer;
        address distributor;
        string qrCode;
        uint256[] fabricIds;
        bool isAvailable;
        uint256 timestamp;
        string name;
        string category;
        string size;
        uint256 price;
        bool isUsedForPackagedStock;
    }

    struct PackagedStock {
        uint256 id;
        address distributor;
        address retailer;
        string qrCode;
        uint256[] apparelIds;
        bool isAvailable;
        uint256 timestamp;
        string name;
        uint256 quantity;
        uint256 price;
        bool isUsedForRetailProduct;
    }

    struct RetailProduct {
        uint256 id;
        address retailer;
        address customer;
        string qrCode;
        uint256[] packagedStockIds;
        bool isAvailable;
        uint256 timestamp;
        string name;
        uint256 price;
        string brand;
        bool isUsedForCustomer;
    }

    // Product mappings
    mapping(uint256 => RawMaterial) public rawMaterials;
    mapping(uint256 => Fabric) public fabrics;
    mapping(uint256 => Apparel) public apparels;
    mapping(uint256 => PackagedStock) public packagedStocks;
    mapping(uint256 => RetailProduct) public retailProducts;


    uint256[] public allRawMaterials;
    uint256[] public allFabrics;
    uint256[] public allApparels;
    uint256[] public allPackagedStocks;
    uint256[] public allRetailProducts;


    // Events
    event RawMaterialAdded(uint256 indexed id, address indexed farmer, string qrCode, uint256 price);
    event RawMaterialSold(uint256 indexed id, address indexed mill, uint256 price);
    event FabricAdded(uint256 indexed id, address indexed mill, string qrCode, uint256 price);
    event FabricSold(uint256 indexed id, address indexed manufacturer, uint256 price);
    event ApparelAdded(uint256 indexed id, address indexed manufacturer, string qrCode, uint256 price);
    event ApparelSold(uint256 indexed id, address indexed distributor, uint256 price);
    event PackagedStockAdded(uint256 indexed id, address indexed distributor, string qrCode, uint256 price);
    event PackagedStockSold(uint256 indexed id, address indexed retailer, uint256 price);
    event RetailProductAdded(uint256 indexed id, address indexed retailer, string qrCode, uint256 price);
    event RetailProductSold(uint256 indexed id, address indexed customer, uint256 price);
    event UserRegistered(address indexed account, string name, string role, string location);

    constructor() {
        // No admin setup needed
    }

    // Modifiers
    modifier onlyRole(bytes32 role) {
        require(hasRole(role, msg.sender), "No role");
        _;
    }

    // Role management functions
    function hasRole(bytes32 role, address account) public view returns (bool) {
        return _roles[account][role];
    }

    function _grantRole(bytes32 role, address account) internal {
        _roles[account][role] = true;
    }

    function _revokeRole(bytes32 role, address account) internal {
        _roles[account][role] = false;
    }

    function registerUser(string memory name, string memory role, string memory location) public {
        bytes32 roleHash;
        
        // Convert string role to bytes32
        if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("FARMER"))) {
            roleHash = FARMER_ROLE;
        } else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("MILL"))) {
            roleHash = MILL_ROLE;
        } else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("MANUFACTURER"))) {
            roleHash = MANUFACTURER_ROLE;
        } else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("DISTRIBUTOR"))) {
            roleHash = DISTRIBUTOR_ROLE;
        } else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("RETAILER"))) {
            roleHash = RETAILER_ROLE;
        } else if (keccak256(abi.encodePacked(role)) == keccak256(abi.encodePacked("CUSTOMER"))) {
            roleHash = CUSTOMER_ROLE;
        } else {
            revert("Invalid role");
        }
        
        // Grant the role
        _grantRole(roleHash, msg.sender);
        
        // Store user information
        users[msg.sender] = UserInfo({
            name: name,
            role: role,
            location: location,
            registrationDate: block.timestamp
        });
        
        emit UserRegistered(msg.sender, name, role, location);
    }

    function revokeRole(bytes32 role, address account) public {
        _revokeRole(role, account);
    }

    // Farmer functions
    function addRawMaterial(
        string memory qrCode,
        string memory name,
        string memory rawMaterialType,
        uint256 quantity,
        uint256 price
    ) external onlyRole(FARMER_ROLE) {
        _rawMaterialIds++;
        uint256 newRawMaterialId = _rawMaterialIds;

        rawMaterials[newRawMaterialId] = RawMaterial({
            id: newRawMaterialId,
            farmer: msg.sender,
            mill: address(0),
            qrCode: qrCode,
            isAvailable: true,
            timestamp: block.timestamp,
            name: name,
            rawMaterialType: rawMaterialType,
            quantity: quantity,
            price: price,
            isUsedForFabric: false
        });

        allRawMaterials.push(newRawMaterialId);
        emit RawMaterialAdded(newRawMaterialId, msg.sender, qrCode, price);
    }


    // Mill functions
    function buyRawMaterial(uint256 rawMaterialId) external payable onlyRole(MILL_ROLE) {
        require(rawMaterials[rawMaterialId].isAvailable, "Not available");
        require(rawMaterials[rawMaterialId].mill == address(0), "Already sold");
        require(msg.value >= rawMaterials[rawMaterialId].price, "Insufficient payment");

        // Transfer ETH to the farmer
        address farmer = rawMaterials[rawMaterialId].farmer;
        (bool success, ) = payable(farmer).call{value: msg.value}("");
        require(success, "Transfer failed");

        rawMaterials[rawMaterialId].mill = msg.sender;
        rawMaterials[rawMaterialId].isAvailable = false;

        emit RawMaterialSold(rawMaterialId, msg.sender, msg.value);
    }

    function addFabric(
        string memory qrCode,
        uint256[] memory rawMaterialIds,
        string memory name,
        string memory composition,
        uint256 price
    ) external onlyRole(MILL_ROLE) {
        _fabricIds++;
        uint256 newFabricId = _fabricIds;

        fabrics[newFabricId] = Fabric({
            id: newFabricId,
            mill: msg.sender,
            manufacturer: address(0),
            qrCode: qrCode,
            rawMaterialIds: rawMaterialIds,
            isAvailable: true,
            timestamp: block.timestamp,
            name: name,
            composition: composition,
            price: price,
            isUsedForApparel: false
        });

        rawMaterials[rawMaterialIds[0]].isUsedForFabric = true;

        allFabrics.push(newFabricId);
        emit FabricAdded(newFabricId, msg.sender, qrCode, price);
    }

    // Manufacturer functions
    function buyFabric(uint256 fabricId) external payable onlyRole(MANUFACTURER_ROLE) {
        require(fabrics[fabricId].isAvailable, "Not available");
        require(fabrics[fabricId].manufacturer == address(0), "Already sold");
        require(msg.value >= fabrics[fabricId].price, "Insufficient payment");

        // Transfer ETH to the mill
        address mill = fabrics[fabricId].mill;
        (bool success, ) = mill.call{value: msg.value}("");
        require(success, "Transfer failed");

        fabrics[fabricId].manufacturer = msg.sender;
        fabrics[fabricId].isAvailable = false;

        allFabrics.push(fabricId);
        emit FabricSold(fabricId, msg.sender, msg.value);
    }

    function addApparel(
        string memory qrCode,
        uint256[] memory fabricIds,
        string memory name,
        string memory category,
        string memory size,
        uint256 price
    ) external onlyRole(MANUFACTURER_ROLE) {
        _apparelIds++;
        uint256 newApparelId = _apparelIds;

        apparels[newApparelId] = Apparel({
            id: newApparelId,
            manufacturer: msg.sender,
            distributor: address(0),
            qrCode: qrCode,
            fabricIds: fabricIds,
            isAvailable: true,
            timestamp: block.timestamp,
            name: name,
            category: category,
            size: size,
            price: price,
            isUsedForPackagedStock: false
        });


        fabrics[fabricIds[0]].isUsedForApparel = true;

        allApparels.push(newApparelId);
        emit ApparelAdded(newApparelId, msg.sender, qrCode, price);
    }

    // Distributor functions
    function buyApparel(uint256 apparelId) external payable onlyRole(DISTRIBUTOR_ROLE) {
        require(apparels[apparelId].isAvailable, "Not available");
        require(apparels[apparelId].distributor == address(0), "Already sold");
        require(msg.value >= apparels[apparelId].price, "Insufficient payment");

        // Transfer ETH to the manufacturer
        address manufacturer = apparels[apparelId].manufacturer;
        (bool success, ) = manufacturer.call{value: msg.value}("");
        require(success, "Transfer failed");

        apparels[apparelId].distributor = msg.sender;
        apparels[apparelId].isAvailable = false;

        emit ApparelSold(apparelId, msg.sender, msg.value);
    }

    function addPackagedStock(
        string memory qrCode,
        uint256[] memory apparelIds,
        string memory name,
        uint256 quantity,
        uint256 price
    ) external onlyRole(DISTRIBUTOR_ROLE) {
        _packagedStockIds++;
        uint256 newPackagedStockId = _packagedStockIds;

        packagedStocks[newPackagedStockId] = PackagedStock({
            id: newPackagedStockId,
            distributor: msg.sender,
            retailer: address(0),
            qrCode: qrCode,
            apparelIds: apparelIds,
            isAvailable: true,
            timestamp: block.timestamp,
            name: name,
            quantity: quantity,
            price: price,
            isUsedForRetailProduct: false
        });

        apparels[apparelIds[0]].isUsedForPackagedStock = true;

        allPackagedStocks.push(newPackagedStockId);
        emit PackagedStockAdded(newPackagedStockId, msg.sender, qrCode, price);
    }

    // Retailer functions
    function buyPackagedStock(uint256 packagedStockId) external payable onlyRole(RETAILER_ROLE) {
        require(packagedStocks[packagedStockId].isAvailable, "Not available");
        require(packagedStocks[packagedStockId].retailer == address(0), "Already sold");
        require(msg.value >= packagedStocks[packagedStockId].price, "Insufficient payment");

        // Transfer ETH to the distributor
        address distributor = packagedStocks[packagedStockId].distributor;
        (bool success, ) = distributor.call{value: msg.value}("");
        require(success, "Transfer failed");

        packagedStocks[packagedStockId].retailer = msg.sender;
        packagedStocks[packagedStockId].isAvailable = false;

        emit PackagedStockSold(packagedStockId, msg.sender, msg.value);
    }

    function addRetailProduct(
        string memory qrCode,
        uint256[] memory packagedStockIds,
        string memory name,
        uint256 price,
        string memory brand
    ) external onlyRole(RETAILER_ROLE) {
        _retailProductIds++;
        uint256 newRetailProductId = _retailProductIds;

        retailProducts[newRetailProductId] = RetailProduct({
            id: newRetailProductId,
            retailer: msg.sender,
            customer: address(0),
            qrCode: qrCode,
            packagedStockIds: packagedStockIds,
            isAvailable: true,
            timestamp: block.timestamp,
            name: name,
            price: price,
            brand: brand,
            isUsedForCustomer: false
        });

        packagedStocks[packagedStockIds[0]].isUsedForRetailProduct = true;

        emit RetailProductAdded(newRetailProductId, msg.sender, qrCode, price);
    }

    // Customer functions
    function buyRetailProduct(uint256 retailProductId) external payable onlyRole(CUSTOMER_ROLE) {
        require(retailProducts[retailProductId].isAvailable, "Not available");
        require(retailProducts[retailProductId].customer == address(0), "Already sold");
        require(msg.value >= retailProducts[retailProductId].price, "Insufficient payment");

        // Transfer ETH to the retailer
        address retailer = retailProducts[retailProductId].retailer;
        (bool success, ) = retailer.call{value: msg.value}("");
        require(success, "Transfer failed");

        retailProducts[retailProductId].customer = msg.sender;
        retailProducts[retailProductId].isAvailable = false;

        emit RetailProductSold(retailProductId, msg.sender, msg.value);
    }

    function getRawMaterial(uint256 rawMaterialId) external view returns (RawMaterial memory) {
        return rawMaterials[rawMaterialId];
    }

    function getFabric(uint256 fabricId) external view returns (Fabric memory) {
        return fabrics[fabricId];
    }

    function getApparel(uint256 apparelId) external view returns (Apparel memory) {
        return apparels[apparelId];
    }

    function getPackagedStock(uint256 packagedStockId) external view returns (PackagedStock memory) {
        return packagedStocks[packagedStockId];
    }

    function getRetailProduct(uint256 retailProductId) external view returns (RetailProduct memory) {
        return retailProducts[retailProductId];
    }


    
    // get all
    function getAllRawMaterials() external view returns (uint256[] memory) {
        return allRawMaterials;
    }

    function getAllFabrics() external view returns (uint256[] memory) {
        return allFabrics;
    }

    function getALlApparels() external view returns (uint256[] memory) {
        return allApparels;
    }

    function getAllPackagedStocks() external view returns (uint256[] memory) {
        return allPackagedStocks;
    }

    function getAllRetailProducts() external view returns (uint256[] memory) {
        return allRetailProducts;
    }
        
    function getUserInfo(address account) external view returns (UserInfo memory) {
        return users[account];
    }
}
