
const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("TextileSupplyChain - User Registration", function () {
    let TextileSupplyChain, contract, owner, user1, user2;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        TextileSupplyChain = await ethers.getContractFactory("TextileSupplyChain");
        contract = await TextileSupplyChain.deploy("SupplyChainToken", "SCT", ethers.utils.parseEther("1000"));
        await contract.deployed();
    });

    it("Should register a new user successfully", async function () {
        const tx = await contract.connect(user1).registerUser("John Doe", "FARMER_ROLE");
        await tx.wait();

        const userId = await contract.userAddressToId(user1.address);
        expect(userId).to.be.gt(0);

        const user = await contract.users(userId);
        expect(user.name).to.equal("John Doe");
        expect(user.role).to.equal("FARMER_ROLE");
        expect(user.isActive).to.be.true;
    });

    it("Should not allow duplicate user registration", async function () {
        await contract.connect(user1).registerUser("John Doe", "FARMER_ROLE");

        await expect(
            contract.connect(user1).registerUser("John Doe", "FARMER_ROLE")
        ).to.be.revertedWith("User already registered");
    });

    it("Should assign correct role to registered user", async function () {
        await contract.connect(user1).registerUser("John Doe", "FARMER_ROLE");

        const farmerRole = await contract.FARMER_ROLE();
        expect(await contract.hasRole(farmerRole, user1.address)).to.be.true;
    });

    it("Should not assign role if invalid role is provided", async function () {
        await contract.connect(user1).registerUser("Alice", "INVALID_ROLE");

        const farmerRole = await contract.FARMER_ROLE();
        expect(await contract.hasRole(farmerRole, user1.address)).to.be.false;
    });

    it("Should fetch registered user details correctly", async function () {
        await contract.connect(user1).registerUser("John Doe", "FARMER_ROLE");

        const userId = await contract.userAddressToId(user1.address);
        const user = await contract.getUser(userId);

        expect(user.name).to.equal("John Doe");
        expect(user.role).to.equal("FARMER_ROLE");
    });
});
