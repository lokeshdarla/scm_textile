// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
contract TextileSupplyChain is ERC20, ReentrancyGuard, AccessControl {
    using Counters for Counters.Counter;

    // Role definitions
    bytes32 public constant FARMER_ROLE = keccak256("FARMER_ROLE");
    bytes32 public constant MILL_ROLE = keccak256("MILL_ROLE");
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");
    bytes32 public constant CUSTOMER_ROLE = keccak256("CUSTOMER_ROLE");

    // Counters for unique IDs
    Counters.Counter private _userIds;
    Counters.Counter private _rawMaterialIds;
    Counters.Counter private _fabricIds;
    Counters.Counter private _productIds;
    Counters.Counter private _transactionIds;

    // Structs
    struct User {
        uint256 id;
        address userAddress;
        string name;
        string role;
        bool isActive;
    }

    struct RawMaterial {
        uint256 id;
        uint256 farmerId;
        string materialType;
        uint256 quantity;
        uint256 price;
        string location;
        bool isAvailable;
        string timestamp;
    }

    struct Fabric {
        uint256 id;
        uint256 millId;
        uint256 rawMaterialId;
        string fabricType;
        uint256 quantity;
        uint256 price;
        bool isAvailable;
        string timestamp;
    }

    struct Product {
        uint256 id;
        uint256 manufacturerId;
        uint256 fabricId;
        string productType;
        uint256 quantity;
        uint256 price;
        string qrCode;
        bool isAvailable;
        string timestamp;
    }

    struct Transaction {
        uint256 id;
        address from;
        address to;
        uint256 amount;
        string status;
        string timestamp;
    }

    // Mappings
    mapping(uint256 => User) public users;
    mapping(uint256 => RawMaterial) public rawMaterials;
    mapping(uint256 => Fabric) public fabrics;
    mapping(uint256 => Product) public products;
    mapping(uint256 => Transaction) public transactions;
    mapping(address => uint256) public userAddressToId;
    mapping(uint256 => string) public productQRCodes;

    // Events
    event UserRegistered(
        uint256 indexed userId,
        address indexed userAddress,
        string role
    );
    event RawMaterialAdded(
        uint256 indexed materialId,
        uint256 indexed farmerId
    );
    event FabricProduced(uint256 indexed fabricId, uint256 indexed millId);
    event ProductManufactured(
        uint256 indexed productId,
        uint256 indexed manufacturerId
    );
    event TransactionCreated(
        uint256 indexed transactionId,
        address indexed from,
        address indexed to
    );
    event QRCodeGenerated(uint256 indexed productId, string qrCode);

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply
    ) ERC20(_name, _symbol) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _mint(msg.sender, _initialSupply * 10 ** decimals());
    }

    // User Registration
    function registerUser(
        string memory _name,
        string memory _role
    ) external nonReentrant returns (uint256) {
        require(userAddressToId[msg.sender] == 0, "User already registered");

        _userIds.increment();
        uint256 newUserId = _userIds.current();

        users[newUserId] = User({
            id: newUserId,
            userAddress: msg.sender,
            name: _name,
            role: _role,
            isActive: true
        });

        userAddressToId[msg.sender] = newUserId;

        // Assign role based on user type
        bytes32 roleHash = keccak256(bytes(_role));
        if (roleHash == FARMER_ROLE) _grantRole(FARMER_ROLE, msg.sender);
        else if (roleHash == MILL_ROLE) _grantRole(MILL_ROLE, msg.sender);
        else if (roleHash == MANUFACTURER_ROLE)
            _grantRole(MANUFACTURER_ROLE, msg.sender);
        else if (roleHash == DISTRIBUTOR_ROLE)
            _grantRole(DISTRIBUTOR_ROLE, msg.sender);
        else if (roleHash == RETAILER_ROLE)
            _grantRole(RETAILER_ROLE, msg.sender);
        else if (roleHash == CUSTOMER_ROLE)
            _grantRole(CUSTOMER_ROLE, msg.sender);

        emit UserRegistered(newUserId, msg.sender, _role);
        return newUserId;
    }

    // Raw Material Management
    function addRawMaterial(
        string memory _materialType,
        uint256 _quantity,
        uint256 _price,
        string memory _location
    ) external onlyRole(FARMER_ROLE) nonReentrant returns (uint256) {
        uint256 farmerId = userAddressToId[msg.sender];

        _rawMaterialIds.increment();
        uint256 newMaterialId = _rawMaterialIds.current();

        rawMaterials[newMaterialId] = RawMaterial({
            id: newMaterialId,
            farmerId: farmerId,
            materialType: _materialType,
            quantity: _quantity,
            price: _price,
            location: _location,
            isAvailable: true,
            timestamp: string(abi.encodePacked(block.timestamp))
        });

        emit RawMaterialAdded(newMaterialId, farmerId);
        return newMaterialId;
    }

    // Fabric Production
    function produceFabric(
        uint256 _rawMaterialId,
        string memory _fabricType,
        uint256 _quantity,
        uint256 _price
    ) external onlyRole(MILL_ROLE) nonReentrant returns (uint256) {
        require(
            rawMaterials[_rawMaterialId].isAvailable,
            "Raw material not available"
        );

        uint256 millId = userAddressToId[msg.sender];

        _fabricIds.increment();
        uint256 newFabricId = _fabricIds.current();

        fabrics[newFabricId] = Fabric({
            id: newFabricId,
            millId: millId,
            rawMaterialId: _rawMaterialId,
            fabricType: _fabricType,
            quantity: _quantity,
            price: _price,
            isAvailable: true,
            timestamp: string(abi.encodePacked(block.timestamp))
        });

        rawMaterials[_rawMaterialId].isAvailable = false;
        emit FabricProduced(newFabricId, millId);
        return newFabricId;
    }

    // Product Manufacturing
    function manufactureProduct(
        uint256 _fabricId,
        string memory _productType,
        uint256 _quantity,
        uint256 _price
    ) external onlyRole(MANUFACTURER_ROLE) nonReentrant returns (uint256) {
        require(fabrics[_fabricId].isAvailable, "Fabric not available");

        uint256 manufacturerId = userAddressToId[msg.sender];

        _productIds.increment();
        uint256 newProductId = _productIds.current();

        products[newProductId] = Product({
            id: newProductId,
            manufacturerId: manufacturerId,
            fabricId: _fabricId,
            productType: _productType,
            quantity: _quantity,
            price: _price,
            qrCode: "",
            isAvailable: true,
            timestamp: string(abi.encodePacked(block.timestamp))
        });

        fabrics[_fabricId].isAvailable = false;
        emit ProductManufactured(newProductId, manufacturerId);
        return newProductId;
    }

    // QR Code Generation
    function generateQRCode(
        uint256 _productId,
        string memory _qrCode
    ) external onlyRole(MANUFACTURER_ROLE) nonReentrant {
        require(
            products[_productId].manufacturerId == userAddressToId[msg.sender],
            "Not authorized"
        );
        products[_productId].qrCode = _qrCode;
        productQRCodes[_productId] = _qrCode;
        emit QRCodeGenerated(_productId, _qrCode);
    }

    // Transaction Management
    function createTransaction(
        address _to,
        uint256 _amount
    ) external nonReentrant returns (uint256) {
        _transactionIds.increment();
        uint256 newTransactionId = _transactionIds.current();

        transactions[newTransactionId] = Transaction({
            id: newTransactionId,
            from: msg.sender,
            to: _to,
            amount: _amount,
            status: "Pending",
            timestamp: string(abi.encodePacked(block.timestamp))
        });

        emit TransactionCreated(newTransactionId, msg.sender, _to);
        return newTransactionId;
    }

    // View Functions
    function getUser(uint256 _userId) external view returns (User memory) {
        return users[_userId];
    }

    function getRawMaterial(
        uint256 _materialId
    ) external view returns (RawMaterial memory) {
        return rawMaterials[_materialId];
    }

    function getFabric(
        uint256 _fabricId
    ) external view returns (Fabric memory) {
        return fabrics[_fabricId];
    }

    function getProduct(
        uint256 _productId
    ) external view returns (Product memory) {
        return products[_productId];
    }

    function getTransaction(
        uint256 _transactionId
    ) external view returns (Transaction memory) {
        return transactions[_transactionId];
    }

    function getProductQRCode(
        uint256 _productId
    ) external view returns (string memory) {
        return productQRCodes[_productId];
    }
}
