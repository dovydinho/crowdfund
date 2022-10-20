// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

/*
* @author Dovydas Lapinskas - https://dovydas.io
*/
import "hardhat/console.sol";

contract ProjectCrowdfundFactory {

    /*
    *   Storage
    */    

    address payable public admin;
    uint public projectsCount;
    ProjectCrowdfund[] public projects;

    /*
    * Custom Errors
    */

    error NeedsMoreThanZero();

    /*
    * Construct
    */
    
    constructor() {
        admin = payable(msg.sender);
    }

    /*
    *  Functions
    */

    // @notice function to create new children contracts.
    function createProjectCrowdfund(uint256 _target) public moreThanZero(_target) {
        new ProjectCrowdfund(address(this), payable(msg.sender), _target);
    }

    // @return project contracts
    function getProjects() external view returns (ProjectCrowdfund[] memory) {
        return projects;
    }

    // @notice External function called when deleting project.
    function removeProject(address _project) external {

        require(_project == msg.sender, 'Function is called NOT from the project contract');

        ProjectCrowdfund[] storage projectContracts = projects;
        
        for(uint256 i = 0; i < projectContracts.length; i++) {

            if( projectContracts[i] == ProjectCrowdfund(payable(_project)) ) {
                projectContracts[i] = projectContracts[projectContracts.length -1];
                projectContracts.pop();
                projectsCount--;
            }
        }
    }

    // @notice External function called when creating new project.
    function insertNewProject(ProjectCrowdfund projectCrowdfund) external {
        projects.push(projectCrowdfund);
        projectsCount++;
    }

    /*
    *   Modifiers
    */

    modifier moreThanZero(uint256 amount) {
        if (amount == 0) {
            revert NeedsMoreThanZero();
        }
        _;
    }
}

contract ProjectCrowdfund {

    /*
    *   Storage
    */

    address public factory;
    address payable public owner;
    Sponsor[] public sponsors;
    Contributor[] public contributors;
    uint256 public sponsorsCount;
    uint256 public contributorsCount;
    uint256 public dateCreated;
    uint256 public target;
    uint256 public unlockedAmount;
    uint256 public nextUnlockTime;
    bool public active;

    mapping(address => Sponsor) public sponsor;
    mapping(address => bool) public isSponsor;
    mapping(address => Contributor) public contributor;
    mapping(address => bool) public isContributor;

    struct Sponsor {
        address sponsor;
        uint256 sponsoredAmount;
        uint256 timestamp;
    }
    struct Contributor {
        address payable contributor;
        uint256 timestamp;
    }

    /*
    *  Constants
    */

    // @notice Distribution frequence set to 7 days (in seconds).
    uint256 DISTRIBUTION_FREQUENCE = 7 * 24 * 60 * 60;

    /*
    * Events
    */

    event NewSponsor(
        address indexed account,
        address indexed project,
        uint256 amount
    );

    /*
    * Custom Errors
    */

    error NeedsMoreThanZero();

    /*
    * Construct
    */

    constructor(address _factory, address payable _owner, uint256 _target) {
        factory = _factory;
        owner = _owner;
        target = _target;
        active = true;
        dateCreated = block.timestamp;
        nextUnlockTime = dateCreated + DISTRIBUTION_FREQUENCE;

        isContributor[_owner] = true;
        contributor[_owner] = Contributor(payable(_owner), block.timestamp);
        contributors.push(contributor[_owner]);
        contributorsCount++;
        ProjectCrowdfundFactory(factory).insertNewProject(ProjectCrowdfund(payable(address(this))));
    }

    /*
    *  Functions
    */

    // @notice function allowing contract owner to edit target amount.
    function editTarget(uint256 newTarget) external onlyOwner {
        target = newTarget;
    }

    // @notice function allowing contract owner to add contributor (address) to contract.
    function addContributor(address payable _contributor) external onlyOwner {
        /*
        *   @notice Only unqiue contributors can be added.
        *   @notice Only project owner can add contributors.
        */
        require(!isContributor[_contributor], 'Already a contributor');
        
        isContributor[_contributor] = true;
        contributor[_contributor] = Contributor(_contributor, block.timestamp);
        contributors.push(contributor[_contributor]);
        contributorsCount++;
    }

    // @notice function allowing contract owner to remove contributor (address) from contract.
    function removeContributor(address _contributor) external onlyOwner {
        /*
        *   @notice Only existing contributors can be removed.
        *   @notice Only project owner can remove contributors.
        *   @notice Owner cannot be removed from contributors.
        */
        require(isContributor[_contributor], 'Not a contributor');
        require(_contributor != owner, 'Cannot remove owner');

        isContributor[_contributor] = false;
        delete contributor[_contributor];
        contributorsCount--;
        // @notice Remove contributor from contributors array
        Contributor[] storage contributorsArray = contributors;
        for(uint256 i = 0; i < contributorsArray.length; i++) {
            if(contributorsArray[i].contributor == _contributor) {
                for(uint256 j = i; j < contributorsArray.length - 1; j++) {
                    contributorsArray[j] = contributorsArray[j + 1];
                }
                contributorsArray.pop();
            }
        }
    }

    // @notice function allowing contract owner to unlock target amount once the unlock time passed.
    function unclockAmount() external onlyOwner moreThanZero(address(this).balance) {
        /*
        *   @notice Contract balance should be more than 0.
        *   @notice Funds should be available for unlock (unlock period passed).
        */
        require(block.timestamp > nextUnlockTime, 'Unlock time has not passed');
        require(address(this).balance - unlockedAmount > 0, 'No remaining funds to unlock');

        unlockedAmount = (address(this).balance > target) ? unlockedAmount + target : unlockedAmount + address(this).balance;
        nextUnlockTime += DISTRIBUTION_FREQUENCE;
    }

    
    // @notice function allowing contract owner to distribute unlocked amount to contract contributors evenly.
    function distribute() public payable onlyOwner moreThanZero(unlockedAmount) moreThanZero(contributorsCount) {
        /*
        *   @notice Unlocked amount should be more than 0.
        *   @notice There should be at least 1 contributor.
        */
        uint256 distributionShare = unlockedAmount / contributorsCount;
        unlockedAmount = 0;

        Contributor[] memory _contributors = contributors;

        for(uint256 i = 0; i < contributorsCount; i++) {
            (bool sent,) = _contributors[i].contributor.call{value: distributionShare}("");
            require(sent, "Failed to send Ether");
        }
    }

    function activate() external onlyOwner isNotActive {
        active = true;
    }

    function deactivate() external onlyOwner isActive {
        active = false;
    }

    receive() external payable {
        emit NewSponsor(msg.sender, address(this), msg.value);
        if(!isSponsor[msg.sender]) {
            isSponsor[msg.sender] = true;
            sponsor[msg.sender] = Sponsor(msg.sender, msg.value, block.timestamp);
            sponsors.push(sponsor[msg.sender]);
            sponsorsCount++;
        } else {
            Sponsor storage existingSponsor = sponsor[msg.sender];
            existingSponsor.sponsoredAmount += msg.value;
            // @notice Update sponsored value in sponsors array
            Sponsor[] storage sponsorsArray = sponsors;
            for(uint256 i = 0; i < sponsorsCount; i++) {
                if(sponsorsArray[i].sponsor == msg.sender) {
                    sponsorsArray[i].sponsoredAmount += msg.value;
                }
            }
        }
    }

    // @return balance of contributions to contract (project).
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // @return summary of project in one smart contract call.
    function getSummary() public view returns (address, address, uint256, uint256, Sponsor[] memory, uint256, Contributor[] memory, uint256, uint256, uint256) {
        return (
            owner,
            address(this),
            address(this).balance,
            target,
            sponsors,
            sponsorsCount,
            contributors,
            contributorsCount,
            nextUnlockTime,
            unlockedAmount
        );
    }

    // @notice Deletes project and sends remnaining funds to owner of project.
    function destroy() external onlyOwner isNotActive {
        ProjectCrowdfundFactory(factory).removeProject(address(this));
        selfdestruct(owner);
    }

    /*
    *   Modifiers
    */

    modifier onlyOwner {
        require(msg.sender == owner, 'Not owner');
        _;
    }

    modifier isNotActive {
        require(active == false, 'Status is active');
        _;
    }

    modifier isActive {
        require(active == true, 'Status is not active');
        _;
    }

    modifier moreThanZero(uint256 amount) {
        if (amount == 0) {
            revert NeedsMoreThanZero();
        }
        _;
    }
}