// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TextileSupplyChain {
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

    // Product structs
    struct RawMaterial {
        uint256 id;
        address farmer;
        address mill;
        string qrCode;
        bool isAvailable;
        uint256 timestamp;
        // Additional attributes
        string name;           // Name of the raw material (e.g., "Organic Cotton")
        string rawMaterialType;           // Type of raw material (e.g., "Cotton", "Wool", "Silk")
        uint256 quantity;      // Quantity in standard units (e.g., kg)
        string origin;         // Origin of the raw material
        uint256 price;         // Price in wei
    }

    struct Fabric {
        uint256 id;
        address mill;
        address manufacturer;
        string qrCode;
        uint256[] rawMaterialIds;
        bool isAvailable;
        uint256 timestamp;
        // Additional attributes
        string name;           // Name of the fabric (e.g., "Denim")
        string composition;    // Composition of the fabric (e.g., "100% Cotton")
        uint256 width;         // Width of the fabric in cm
        string color;          // Color of the fabric
        uint256 price;         // Price in wei
    }

    struct Apparel {
        uint256 id;
        address manufacturer;
        address distributor;
        string qrCode;
        uint256[] fabricIds;
        bool isAvailable;
        uint256 timestamp;
        // Additional attributes
        string name;           // Name of the apparel (e.g., "Blue Jeans")
        string category;       // Category of apparel (e.g., "Pants", "Shirts")
        string size;           // Size of the apparel (e.g., "M", "L", "XL")
        string color;          // Color of the apparel
        uint256 price;         // Price in wei
    }

    struct PackagedStock {
        uint256 id;
        address distributor;
        address retailer;
        string qrCode;
        uint256[] apparelIds;
        bool isAvailable;
        uint256 timestamp;
        // Additional attributes
        string name;           // Name of the packaged stock (e.g., "Summer Collection")
        uint256 quantity;      // Quantity of items in the package
        string packagingType;  // Type of packaging (e.g., "Box", "Bag")
        string shippingInfo;   // Shipping information
        uint256 price;         // Price in wei
    }

    struct RetailProduct {
        uint256 id;
        address retailer;
        address customer;
        string qrCode;
        uint256[] packagedStockIds;
        bool isAvailable;
        uint256 timestamp;
        // Additional attributes
        string name;           // Name of the retail product (e.g., "Premium Jeans")
        uint256 price;         // Price of the product in wei
        string brand;          // Brand of the product
        string description;    // Description of the product
    }

    // Product mappings
    mapping(uint256 => RawMaterial) public rawMaterials;
    mapping(uint256 => Fabric) public fabrics;
    mapping(uint256 => Apparel) public apparels;
    mapping(uint256 => PackagedStock) public packagedStocks;
    mapping(uint256 => RetailProduct) public retailProducts;

    // Available products
    uint256[] public availableRawMaterials;
    uint256[] public availableFabrics;
    uint256[] public availableApparels;
    uint256[] public availablePackagedStocks;
    uint256[] public availableRetailProducts;

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
        require(hasRole(role, msg.sender), "Caller does not have the required role");
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
        string memory origin,
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
            origin: origin,
            price: price
        });

        availableRawMaterials.push(newRawMaterialId);
        emit RawMaterialAdded(newRawMaterialId, msg.sender, qrCode, price);
    }

    // Mill functions
    function buyRawMaterial(uint256 rawMaterialId) external payable onlyRole(MILL_ROLE) {
        require(rawMaterials[rawMaterialId].isAvailable, "Raw material not available");
        require(rawMaterials[rawMaterialId].mill == address(0), "Raw material already sold");
        require(msg.value >= rawMaterials[rawMaterialId].price, "Insufficient payment");

        // Transfer ETH to the farmer
        address farmer = rawMaterials[rawMaterialId].farmer;
        (bool success, ) = farmer.call{value: msg.value}("");
        require(success, "Transfer failed");

        rawMaterials[rawMaterialId].mill = msg.sender;
        rawMaterials[rawMaterialId].isAvailable = false;

        // Remove from available materials
        for (uint i = 0; i < availableRawMaterials.length; i++) {
            if (availableRawMaterials[i] == rawMaterialId) {
                availableRawMaterials[i] = availableRawMaterials[availableRawMaterials.length - 1];
                availableRawMaterials.pop();
                break;
            }
        }

        emit RawMaterialSold(rawMaterialId, msg.sender, msg.value);
    }

    function addFabric(
        string memory qrCode,
        uint256[] memory rawMaterialIds,
        string memory name,
        string memory composition,
        uint256 width,
        string memory color,
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
            width: width,
            color: color,
            price: price
        });

        availableFabrics.push(newFabricId);
        emit FabricAdded(newFabricId, msg.sender, qrCode, price);
    }

    // Manufacturer functions
    function buyFabric(uint256 fabricId) external payable onlyRole(MANUFACTURER_ROLE) {
        require(fabrics[fabricId].isAvailable, "Fabric not available");
        require(fabrics[fabricId].manufacturer == address(0), "Fabric already sold");
        require(msg.value >= fabrics[fabricId].price, "Insufficient payment");

        // Transfer ETH to the mill
        address mill = fabrics[fabricId].mill;
        (bool success, ) = mill.call{value: msg.value}("");
        require(success, "Transfer failed");

        fabrics[fabricId].manufacturer = msg.sender;
        fabrics[fabricId].isAvailable = false;

        // Remove from available fabrics
        for (uint i = 0; i < availableFabrics.length; i++) {
            if (availableFabrics[i] == fabricId) {
                availableFabrics[i] = availableFabrics[availableFabrics.length - 1];
                availableFabrics.pop();
                break;
            }
        }

        emit FabricSold(fabricId, msg.sender, msg.value);
    }

    function addApparel(
        string memory qrCode,
        uint256[] memory fabricIds,
        string memory name,
        string memory category,
        string memory size,
        string memory color,
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
            color: color,
            price: price
        });

        availableApparels.push(newApparelId);
        emit ApparelAdded(newApparelId, msg.sender, qrCode, price);
    }

    // Distributor functions
    function buyApparel(uint256 apparelId) external payable onlyRole(DISTRIBUTOR_ROLE) {
        require(apparels[apparelId].isAvailable, "Apparel not available");
        require(apparels[apparelId].distributor == address(0), "Apparel already sold");
        require(msg.value >= apparels[apparelId].price, "Insufficient payment");

        // Transfer ETH to the manufacturer
        address manufacturer = apparels[apparelId].manufacturer;
        (bool success, ) = manufacturer.call{value: msg.value}("");
        require(success, "Transfer failed");

        apparels[apparelId].distributor = msg.sender;
        apparels[apparelId].isAvailable = false;

        // Remove from available apparels
        for (uint i = 0; i < availableApparels.length; i++) {
            if (availableApparels[i] == apparelId) {
                availableApparels[i] = availableApparels[availableApparels.length - 1];
                availableApparels.pop();
                break;
            }
        }

        emit ApparelSold(apparelId, msg.sender, msg.value);
    }

    function addPackagedStock(
        string memory qrCode,
        uint256[] memory apparelIds,
        string memory name,
        uint256 quantity,
        string memory packagingType,
        string memory shippingInfo,
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
            packagingType: packagingType,
            shippingInfo: shippingInfo,
            price: price
        });

        availablePackagedStocks.push(newPackagedStockId);
        emit PackagedStockAdded(newPackagedStockId, msg.sender, qrCode, price);
    }

    // Retailer functions
    function buyPackagedStock(uint256 packagedStockId) external payable onlyRole(RETAILER_ROLE) {
        require(packagedStocks[packagedStockId].isAvailable, "Packaged stock not available");
        require(packagedStocks[packagedStockId].retailer == address(0), "Packaged stock already sold");
        require(msg.value >= packagedStocks[packagedStockId].price, "Insufficient payment");

        // Transfer ETH to the distributor
        address distributor = packagedStocks[packagedStockId].distributor;
        (bool success, ) = distributor.call{value: msg.value}("");
        require(success, "Transfer failed");

        packagedStocks[packagedStockId].retailer = msg.sender;
        packagedStocks[packagedStockId].isAvailable = false;

        // Remove from available packaged stocks
        for (uint i = 0; i < availablePackagedStocks.length; i++) {
            if (availablePackagedStocks[i] == packagedStockId) {
                availablePackagedStocks[i] = availablePackagedStocks[availablePackagedStocks.length - 1];
                availablePackagedStocks.pop();
                break;
            }
        }

        emit PackagedStockSold(packagedStockId, msg.sender, msg.value);
    }

    function addRetailProduct(
        string memory qrCode,
        uint256[] memory packagedStockIds,
        string memory name,
        uint256 price,
        string memory brand,
        string memory description
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
            description: description
        });

        availableRetailProducts.push(newRetailProductId);
        emit RetailProductAdded(newRetailProductId, msg.sender, qrCode, price);
    }

    // Customer functions
    function buyRetailProduct(uint256 retailProductId) external payable onlyRole(CUSTOMER_ROLE) {
        require(retailProducts[retailProductId].isAvailable, "Retail product not available");
        require(retailProducts[retailProductId].customer == address(0), "Retail product already sold");
        require(msg.value >= retailProducts[retailProductId].price, "Insufficient payment");

        // Transfer ETH to the retailer
        address retailer = retailProducts[retailProductId].retailer;
        (bool success, ) = retailer.call{value: msg.value}("");
        require(success, "Transfer failed");

        retailProducts[retailProductId].customer = msg.sender;
        retailProducts[retailProductId].isAvailable = false;

        // Remove from available retail products
        for (uint i = 0; i < availableRetailProducts.length; i++) {
            if (availableRetailProducts[i] == retailProductId) {
                availableRetailProducts[i] = availableRetailProducts[availableRetailProducts.length - 1];
                availableRetailProducts.pop();
                break;
            }
        }

        emit RetailProductSold(retailProductId, msg.sender, msg.value);
    }

    // View functions
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

    function getAvailableRawMaterials() external view returns (uint256[] memory) {
        return availableRawMaterials;
    }

    function getAvailableFabrics() external view returns (uint256[] memory) {
        return availableFabrics;
    }

    function getAvailableApparels() external view returns (uint256[] memory) {
        return availableApparels;
    }

    function getAvailablePackagedStocks() external view returns (uint256[] memory) {
        return availablePackagedStocks;
    }

    function getAvailableRetailProducts() external view returns (uint256[] memory) {
        return availableRetailProducts;
    }
    
    function getUserInfo(address account) external view returns (UserInfo memory) {
        return users[account];
    }
} 
