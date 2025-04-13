// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChainPhase1 {
    enum UserRole { Farmer, Mill, Manufacturer, Distributor, Retailer, None }

    address private admin;
    uint256 private _userCounter;
    uint256 private _rawMaterialIdCounter;
    uint256 private _fabricIdCounter;
    uint256 private _productIdCounter;
    uint256 private _millIdCounter;
    uint256 private _farmerIdCounter;
    uint256 private _manufacturerIdCounter;
    uint256 private _distributorIdCounter;
    uint256 private _retailerIdCounter;
    uint256 private _transactionId;
    uint256 private _requestIdCounter;

    struct RawMaterial {
        uint256 id;
        uint256 farmerId;
        string materialType;
        uint256 quantity;
        uint256 price;
        bool isAvailable;
        string qrHash;
    }

    struct Fabric {
        uint256 id;
        uint256 millId;
        uint256 rawMaterialId;
        uint256 quantity;
        uint256 price;
        bool isAvailable;
        string qrHash;
    }

    struct Product {
        uint256 id;
        uint256 manufacturerId;
        uint256 fabricId;
        string productType;
        uint256 quantity;
        uint256 price;
        bool isAvailable;
        string qrHash;
    }

    struct User {
        uint256 id;
        string name;
        UserRole role;
        string location;
    }

    struct Transaction {
        uint256 id;
        string TransactionHash;
        address from;
        address to;
        uint256 amount;
        uint256 timestamp;
        string qrHash;
    }

    struct ProductRequest {
        uint256 id;
        uint256 retailerId;
        uint256 distributorId;
        uint256 productId;
        uint256 quantity;
        uint256 price;
        string status;
        uint256 timestamp;
    }

    // Mappings
    mapping(uint256 => RawMaterial) private rawMaterials;
    mapping(uint256 => uint256[]) private farmerIdToRawMaterialIds;
    mapping(uint256 => Fabric) private fabrics;
    mapping(uint256 => uint256[]) private millIdToFabricIds;
    mapping(uint256 => uint256) private rawMaterialsOwnedByMill;
    mapping(uint256 => Product) private products;
    mapping(uint256 => uint256[]) private manufacturerIdToProductIds;
    mapping(uint256 => uint256) private fabricOwnedByManufacturer;
    mapping(uint256 => uint256[]) private distributorIdToProductIds;
    mapping(uint256 => uint256) private productOwnedByDistributor;
    mapping(uint256 => uint256[]) private retailerIdToProductIds;
    mapping(uint256 => uint256) private productOwnedByRetailer;
    mapping(uint256 => ProductRequest) private productRequests;
    mapping(uint256 => uint256[]) private distributorIdToRequestIds;
    mapping(uint256 => uint256[]) private retailerIdToRequestIds;
    mapping(address => uint256) private userAddressToFarmerId;
    mapping(address => uint256) private userAddressToMillId;
    mapping(address => uint256) private userAddressToManufacturerId;
    mapping(address => uint256) private userAddressToDistributorId;
    mapping(address => uint256) private userAddressToRetailerId;
    mapping(address => User) private userDetails;
    mapping(address => UserRole) private userRoles;
    mapping(uint256 => address) private FarmerIdToAddress;
    mapping(uint256 => address) private MillIdToAddress;
    mapping(uint256 => address) private ManufacturerIdToAddress;
    mapping(uint256 => address) private DistributorIdToAddress;
    mapping(uint256 => address) private RetailerIdToAddress;
    mapping(uint256 => Transaction) private transactions;
    mapping(uint256 => Transaction[]) private farmerTransactions;
    mapping(uint256 => Transaction[]) private millTransactions;
    mapping(uint256 => Transaction[]) private manufacturerTransactions;
    mapping(uint256 => Transaction[]) private distributorTransactions;
    mapping(uint256 => Transaction[]) private retailerTransactions;

    // Modifiers
    modifier onlyNewUser() {
        require(userDetails[msg.sender].id == 0, "user already registered");
        _;
    }

    modifier onlyFarmer() {
        require(userRoles[msg.sender] == UserRole.Farmer, "Only Farmers allowed");
        _;
    }

    modifier onlyMill() {
        require(userRoles[msg.sender] == UserRole.Mill, "Only Mills allowed");
        _;
    }

    modifier onlyManufacturer() {
        require(userRoles[msg.sender] == UserRole.Manufacturer, "Only Manufacturers allowed");
        _;
    }

    modifier onlyDistributor() {
        require(userRoles[msg.sender] == UserRole.Distributor, "Only Distributors allowed");
        _;
    }

    modifier onlyRetailer() {
        require(userRoles[msg.sender] == UserRole.Retailer, "Only Retailers allowed");
        _;
    }

    // Helper functions
    function stringToUserRole(string memory role) public pure returns (UserRole) {
        bytes32 roleHash = keccak256(abi.encodePacked(role));
        if (roleHash == keccak256(abi.encodePacked("Farmer"))) return UserRole.Farmer;
        if (roleHash == keccak256(abi.encodePacked("Mill"))) return UserRole.Mill;
        if (roleHash == keccak256(abi.encodePacked("Manufacturer"))) return UserRole.Manufacturer;
        if (roleHash == keccak256(abi.encodePacked("Distributor"))) return UserRole.Distributor;
        if (roleHash == keccak256(abi.encodePacked("Retailer"))) return UserRole.Retailer;
        return UserRole.None;
    }

    // payments
    receive() external payable {}

    fallback() external payable {}

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function sendEther(address payable recipient, uint256 amountInWei) public {
        (bool sent, ) = recipient.call{value: amountInWei}("");
        require(sent, "Failed to send Ether");
    }

    function getBuyerDetails(uint256 transactionId) external view returns (User memory user)
    {
        Transaction memory currentTransaction = transactions[transactionId];
        user = userDetails[currentTransaction.to];
        return user;
    }

    // transactions
    function recordTransaction(
        address _from,
        address _to,
        uint256 _amount,
        uint256 _timestamp,
        string memory _transactionHash,
        string memory _qrHash
    ) external returns (uint256 transactionId) {
        require(_from == msg.sender || _to == msg.sender, "Not authorized to record this transaction");

        _transactionId++;
        transactionId = _transactionId;

        Transaction memory transaction = Transaction({ 
            id: transactionId,
            TransactionHash : _transactionHash,
            from: _from,
            to: _to,
            amount: _amount,
            timestamp: _timestamp,
            qrHash: _qrHash
        });

        transactions[transactionId] = transaction;

        UserRole role_from = userDetails[_from].role;
        UserRole role_to = userDetails[_to].role;

        if (role_from == UserRole.Farmer) {
            farmerTransactions[userAddressToFarmerId[_from]].push(transaction);
        } else if (role_from == UserRole.Mill) {
            millTransactions[userAddressToMillId[_from]].push(transaction);
        } else if (role_from == UserRole.Manufacturer) {
            manufacturerTransactions[userAddressToManufacturerId[_from]].push(transaction);
        } else if (role_from == UserRole.Distributor) {
            distributorTransactions[userAddressToDistributorId[_from]].push(transaction);
        } else if (role_from == UserRole.Retailer) {
            retailerTransactions[userAddressToRetailerId[_from]].push(transaction);
        }

        if (role_to == UserRole.Farmer) {
            farmerTransactions[userAddressToFarmerId[_to]].push(transaction);
        } else if (role_to == UserRole.Mill) {
            millTransactions[userAddressToMillId[_to]].push(transaction);
        } else if (role_to == UserRole.Manufacturer) {
            manufacturerTransactions[userAddressToManufacturerId[_to]].push(transaction);
        } else if (role_to == UserRole.Distributor) {
            distributorTransactions[userAddressToDistributorId[_to]].push(transaction);
        } else if (role_to == UserRole.Retailer) {
            retailerTransactions[userAddressToRetailerId[_to]].push(transaction);
        }

        return transactionId;
    }

    // New function to record transaction after the fact
    function recordTransactionAfter(
        uint256 _transactionId,
        string memory _transactionHash
    ) external returns (string memory status) {
        require(transactions[_transactionId].id != 0, "Transaction not found");
        require(transactions[_transactionId].from == msg.sender || transactions[_transactionId].to == msg.sender, 
                "Not authorized to update this transaction");
        
        transactions[_transactionId].TransactionHash = _transactionHash;
        return "Transaction hash updated successfully";
    }

    function getTransactions() external view returns (Transaction[] memory transactionss) {
        User memory user = userDetails[msg.sender];
        UserRole role_from = user.role;

        if (role_from == UserRole.Farmer) {
            transactionss = farmerTransactions[userAddressToFarmerId[msg.sender]];
        } else if (role_from == UserRole.Mill) {
            transactionss = millTransactions[userAddressToMillId[msg.sender]];
        } else if (role_from == UserRole.Manufacturer) {
            transactionss = manufacturerTransactions[userAddressToManufacturerId[msg.sender]];
        } else if (role_from == UserRole.Distributor) {
            transactionss = distributorTransactions[userAddressToDistributorId[msg.sender]];
        } else if (role_from == UserRole.Retailer) {
            transactionss = retailerTransactions[userAddressToRetailerId[msg.sender]];
        } else {
            revert("Invalid role");
        }

        return transactionss;
    }

    //users
    function registerUser(
        string memory _name,
        string memory _location,
        string memory _role
    ) external onlyNewUser returns (uint256 id) {
        UserRole role = stringToUserRole(_role);
        require(role != UserRole.None, "Invalid role");
        _userCounter++;

        uint256 userId;
        if (role == UserRole.Farmer) {
            require(userAddressToFarmerId[msg.sender] == 0, "User already registered as farmer");
            _farmerIdCounter++;
            userId = _farmerIdCounter;
            FarmerIdToAddress[userId] = msg.sender;
            userAddressToFarmerId[msg.sender] = userId;
        } else if (role == UserRole.Mill) {
            require(userAddressToMillId[msg.sender] == 0, "User already registered as mill");
            _millIdCounter++;
            userId = _millIdCounter;
            MillIdToAddress[userId] = msg.sender;
            userAddressToMillId[msg.sender] = userId;
        } else if (role == UserRole.Manufacturer) {
            require(userAddressToManufacturerId[msg.sender] == 0, "User already registered as manufacturer");
            _manufacturerIdCounter++;
            userId = _manufacturerIdCounter;
            ManufacturerIdToAddress[userId] = msg.sender;
            userAddressToManufacturerId[msg.sender] = userId;
        } else if (role == UserRole.Distributor) {
            require(userAddressToDistributorId[msg.sender] == 0, "User already registered as distributor");
            _distributorIdCounter++;
            userId = _distributorIdCounter;
            DistributorIdToAddress[userId] = msg.sender;
            userAddressToDistributorId[msg.sender] = userId;
        } else if (role == UserRole.Retailer) {
            require(userAddressToRetailerId[msg.sender] == 0, "User already registered as retailer");
            _retailerIdCounter++;
            userId = _retailerIdCounter;
            RetailerIdToAddress[userId] = msg.sender;
            userAddressToRetailerId[msg.sender] = userId;
        }

        userDetails[msg.sender] = User({
            id: userId,
            name: _name,
            role: role,
            location: _location
        });
        
        userRoles[msg.sender] = role;
        return userId;
    }

    function getUserDetails() external view returns (User memory user)
    {
        user = userDetails[msg.sender];
        require(user.role != UserRole.None, "User not registered");
        return user;
    }

    //farmers
    function addRawMaterial(
        string memory _qrHash,
        string memory _materialType,
        uint256 _quantity,
        uint256 _price,
        string memory _location
    ) external onlyFarmer returns (uint256) {
        uint256 _farmerId = userAddressToFarmerId[msg.sender];
        _rawMaterialIdCounter++;

        rawMaterials[_rawMaterialIdCounter] = RawMaterial({
            id: _rawMaterialIdCounter,
            farmerId: _farmerId,
            materialType: _materialType,
            quantity: _quantity,
            price: _price,
            isAvailable: true,
            qrHash: _qrHash
        });

        farmerIdToRawMaterialIds[_farmerId].push(_rawMaterialIdCounter);

        return _rawMaterialIdCounter;
    }

    function getRawMaterial(uint256 _rawMaterialId) external view onlyFarmer returns (RawMaterial memory) {
        require(rawMaterials[_rawMaterialId].isAvailable, "Raw Material not available");
        return rawMaterials[_rawMaterialId];
    } // iterate over the raw material ids and return the raw materials of the farmer from ethers

    function getAllRawMaterials() external view onlyFarmer returns (uint256[] memory rawMaterialIds) {
        uint256 _farmerId = userAddressToFarmerId[msg.sender];
        rawMaterialIds = farmerIdToRawMaterialIds[_farmerId];
        require(rawMaterialIds.length > 0, "No raw materials found");
        return rawMaterialIds;
    }

    //mills
    function addFabric(
        string memory _qrHash,
        uint256 _rawMaterialId,
        uint256 _quantity,
        uint256 _price,
        string memory _location
    ) external onlyMill returns (uint256) {
        require(rawMaterialsOwnedByMill[_rawMaterialId] != 0, "Raw material not owned by mill");

        uint256 _millId = userAddressToMillId[msg.sender];
        _fabricIdCounter++;

        fabrics[_fabricIdCounter] = Fabric({
            id: _fabricIdCounter,
            millId: _millId,
            rawMaterialId: _rawMaterialId,
            quantity: _quantity,
            price: _price,
            isAvailable: true,
            qrHash: _qrHash
        });

        millIdToFabricIds[_millId].push(_fabricIdCounter);
        return _fabricIdCounter;
    }

    function buyRawMaterial(
        uint256 _rawMaterialId
    ) external onlyMill returns (string memory status) {
        require(rawMaterials[_rawMaterialId].isAvailable, "Raw material not available");

        uint256 _millId = userAddressToMillId[msg.sender];
        uint256 _farmerId = rawMaterials[_rawMaterialId].farmerId;

        uint256 _amount = rawMaterials[_rawMaterialId].price * rawMaterials[_rawMaterialId].quantity;

        rawMaterials[_rawMaterialId].isAvailable = false;
        rawMaterialsOwnedByMill[_rawMaterialId] = _millId;

        return "Raw material bought successfully";
    }

    function validateRawMaterial(
        uint256 _rawMaterialId
    ) external view returns (RawMaterial memory rawMaterial) {
        // require(rawMaterials[_rawMaterialId] != 0, "Raw material not found");
        // require(rawMaterials[_rawMaterialId].isAvailable, "Raw material not available");
        // require(rawMaterialsOwnedByMill[_rawMaterialId] == 0, "Raw material not owned by mill");
        rawMaterial = rawMaterials[_rawMaterialId];
        return rawMaterial;
    }

    function getFabric(uint256 _fabricId) external view onlyMill returns (Fabric memory fabric) {
        fabric = fabrics[_fabricId];
        require(fabric.isAvailable, "Fabric not available");
        return fabric;
    } // iterate over the fabric ids and return the fabrics of the mill from ethers

    function getAllFabrics() external view onlyMill returns (uint256[] memory fabricIds) {
        uint256 _millId = userAddressToMillId[msg.sender];
        // fabricss = millFabrics[_millId];
        fabricIds = millIdToFabricIds[_millId];
        require(fabricIds.length > 0, "No fabrics found");
        return fabricIds;
    }

    //manufacturers
    function addProduct(
        string memory _qrHash,
        uint256 _fabricId,
        string memory _productType,
        uint256 _quantity,
        uint256 _price,
        string memory _location
    ) external onlyManufacturer returns (uint256) {
        // require(fabrics[_fabricId].isAvailable, "Fabric not available");
        require(fabricOwnedByManufacturer[_fabricId] !=0, "Fabric not owned by the manufacturer");

        uint256 _manufacturerId = userAddressToManufacturerId[msg.sender];
        fabrics[_fabricId].isAvailable = false;

        _productIdCounter++;
        products[_productIdCounter] = Product({
            id: _productIdCounter,
            manufacturerId: _manufacturerId,
            fabricId: _fabricId,
            productType: _productType,
            quantity: _quantity,
            price: _price,
            isAvailable: true,
            qrHash: _qrHash
        });

        manufacturerIdToProductIds[_manufacturerId].push(_productIdCounter);
        return _productIdCounter;
    }

    function buyFabric(
        uint256 _fabricId
    ) external onlyManufacturer returns (string memory status) {
        require(fabrics[_fabricId].isAvailable, "Fabric not available");

        uint256 _manufacturerId = userAddressToManufacturerId[msg.sender];
        uint256 _millId = fabrics[_fabricId].millId;

        uint256 _amount = fabrics[_fabricId].price * fabrics[_fabricId].quantity;

        fabrics[_fabricId].isAvailable = false;
        fabricOwnedByManufacturer[_fabricId] = _manufacturerId;

        return "Fabric purchased successfully";
    }

    function getProduct(uint256 _productId) external view onlyManufacturer returns (Product memory product) {
        product = products[_productId];
        require(product.isAvailable, "Product not available");
        return product;
    } // iterate over the product ids and return the products of the manufacturer from ethers

    function getAllProducts() external view onlyManufacturer returns (uint256[] memory productIds) {
        uint256 _manufacturerId = userAddressToManufacturerId[msg.sender];
        productIds = manufacturerIdToProductIds[_manufacturerId];
        require(productIds.length > 0, "No products found");
        return productIds;
    }

    // Distributor functions
    function buyProduct(
        uint256 _productId
    ) external onlyDistributor returns (uint256 transactionId, uint256 amount) {
        require(products[_productId].isAvailable, "Product not available");

        uint256 _distributorId = userAddressToDistributorId[msg.sender];
        uint256 _manufacturerId = products[_productId].manufacturerId;

        amount = products[_productId].price * products[_productId].quantity;

        // products[_productId].isAvailable = false; // remove this condition as the product exist all time
        productOwnedByDistributor[_productId] = _distributorId;
        distributorIdToProductIds[_distributorId].push(_productId);

        return (transactionId, amount);
    }

    function sellToRetailer(
        uint256 _requestId
    ) external  onlyDistributor returns (uint256 transactionId, uint256 amount) {
        ProductRequest memory request = productRequests[_requestId];
        require(keccak256(abi.encodePacked(request.status)) == keccak256(abi.encodePacked("APPROVED")), "Request not approved");
        require(request.distributorId == userAddressToDistributorId[msg.sender], "Not authorized to process this request");

        uint256 _distributorId = userAddressToDistributorId[msg.sender];
        uint256 _retailerId = request.retailerId;
        uint256 _productId = request.productId;

        require(productOwnedByDistributor[_productId] == _distributorId, "Product not owned by distributor");

        amount = request.price * request.quantity;

        // Transfer ownership to retailer
        productOwnedByDistributor[_productId] = 0;
        productOwnedByRetailer[_productId] = _retailerId;
        retailerIdToProductIds[_retailerId].push(_productId);

        // Generate a new transaction ID
        transactionId = _transactionId + 1;

        return (transactionId, amount);
    }

    function getDistributorProducts() external view onlyDistributor returns (uint256[] memory productIds) {
        uint256 _distributorId = userAddressToDistributorId[msg.sender];
        productIds = distributorIdToProductIds[_distributorId];
        require(productIds.length > 0, "No products found");
        return productIds;
    }

    // Retailer functions
    function getRetailerProducts() external view onlyRetailer returns (uint256[] memory productIds) {
        uint256 _retailerId = userAddressToRetailerId[msg.sender];
        productIds = retailerIdToProductIds[_retailerId];
        require(productIds.length > 0, "No products found");
        return productIds;
    }

    function sellToCustomer(
        uint256 _productId,
        address _customerAddress
    ) external view onlyRetailer returns (uint256 transactionId, uint256 amount) {
        uint256 _retailerId = userAddressToRetailerId[msg.sender];
        require(productOwnedByRetailer[_productId] == _retailerId, "Product not owned by retailer");

        amount = products[_productId].price * products[_productId].quantity;

        // Generate a new transaction ID
        transactionId = _transactionId + 1;

        return (transactionId, amount);
    }

    // Request functions
    function createRequest(
        uint256 _retailerId,
        uint256 _distributorId,
        uint256 _productId,
        uint256 _quantity,
        uint256 _price
    ) external onlyRetailer returns (uint256 requestId) {
        // require(productOwnedByRetailer[_productId] == _retailerId, "Product not owned by retailer"); // remove this shit

        _requestIdCounter++;
        productRequests[_requestIdCounter] = ProductRequest({
            id: _requestIdCounter,
            retailerId: _retailerId,
            distributorId: _distributorId,
            productId: _productId,
            quantity: _quantity,
            price: _price,
            status: "PENDING",
            timestamp: block.timestamp
        });

        distributorIdToRequestIds[_distributorId].push(_requestIdCounter);
        retailerIdToRequestIds[_retailerId].push(_requestIdCounter);

        return _requestIdCounter;
    }

    function approveRequest(uint256 _requestId) external onlyDistributor returns (uint256 transactionId, uint256 amount) {
        ProductRequest memory request = productRequests[_requestId];
        require(request.distributorId == userAddressToDistributorId[msg.sender], "Not authorized to approve this request");
        require(keccak256(abi.encodePacked(request.status)) == keccak256(abi.encodePacked("PENDING")), "Request already processed");
        require(productOwnedByDistributor[request.productId] == request.distributorId, "Product not owned by distributor");

        amount = request.price * request.quantity;

        // productOwnedByDistributor[request.productId] = 0;
        productOwnedByRetailer[request.productId] = request.retailerId;
        retailerIdToProductIds[request.retailerId].push(request.productId);

        productRequests[_requestId].status = "APPROVED";
        transactionId = _transactionId + 1;

        // this.sellToRetailer(_requestId);

        return (transactionId, amount);
    }

    function rejectRequest(uint256 _requestId) external view onlyDistributor returns (string memory status) {
        ProductRequest memory request = productRequests[_requestId];
        require(request.distributorId == userAddressToDistributorId[msg.sender], "Not authorized to reject this request");
        require(keccak256(abi.encodePacked(request.status)) == keccak256(abi.encodePacked("PENDING")), "Request already processed");

        request.status = "REJECTED";
        return "Request rejected successfully";
    }

    function getRequestDetails(uint256 _requestId) external view returns (ProductRequest memory request) {
        request = productRequests[_requestId];
        require(request.id != 0, "Request not found");
        return request;
    }

    function getDistributorRequests() external view onlyDistributor returns (uint256[] memory requestIds) {
        uint256 _distributorId = userAddressToDistributorId[msg.sender];
        requestIds = distributorIdToRequestIds[_distributorId];
        require(requestIds.length > 0, "No requests found");
        return requestIds;
    }

    function getRetailerRequests() external view onlyRetailer returns (uint256[] memory requestIds) {
        uint256 _retailerId = userAddressToRetailerId[msg.sender];
        requestIds = retailerIdToRequestIds[_retailerId];
        require(requestIds.length > 0, "No requests found");
        return requestIds;
    }
}
