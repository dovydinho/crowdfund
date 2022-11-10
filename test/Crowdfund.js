const { expect } = require('chai');
const { ethers } = require('hardhat');
const { time } = require('@nomicfoundation/hardhat-network-helpers');

describe('ProjectCrowdfunds', function () {
  let ProjectCrowdfundFactory,
    projectCrowdfundFactory,
    owner,
    address1,
    address2,
    address3,
    ProjectCrowdfund,
    projectCrowdfund;

  this.beforeEach(async () => {
    [owner, address1, address2, address3, _] = await ethers.getSigners();
    ProjectCrowdfundFactory = await ethers.getContractFactory(
      'ProjectCrowdfundFactory'
    );
    projectCrowdfundFactory = await ProjectCrowdfundFactory.deploy();
    ProjectCrowdfund = await ethers.getContractFactory('ProjectCrowdfund');
  });

  describe('Project Payrolls Factory', function () {
    describe('Positive Outcomes', function () {
      it('Should create new ProjectCrowdfund contract with correct values and increment projectsCount', async function () {
        await projectCrowdfundFactory
          .connect(address1)
          .createProjectCrowdfund(100);
        expect(await projectCrowdfundFactory.projectsCount()).to.equal(1);

        await projectCrowdfundFactory
          .connect(address2)
          .createProjectCrowdfund(150);
        expect(await projectCrowdfundFactory.projectsCount()).to.equal(2);

        projectCrowdfund = ProjectCrowdfund.attach(
          projectCrowdfundFactory.projects(0)
        );
        expect(await projectCrowdfund.owner()).to.equal(address1.address);
        expect(await projectCrowdfund.target()).to.equal(100);

        projectCrowdfund = ProjectCrowdfund.attach(
          projectCrowdfundFactory.projects(1)
        );
        expect(await projectCrowdfund.owner()).to.equal(address2.address);
        expect(await projectCrowdfund.target()).to.equal(150);
      });

      it('Should remove existing project and decrement projectsCount', async function () {
        await projectCrowdfundFactory
          .connect(address1)
          .createProjectCrowdfund(100);
        expect(await projectCrowdfundFactory.projectsCount()).to.equal(1);

        projectCrowdfund = ProjectCrowdfund.attach(
          projectCrowdfundFactory.projects(0)
        );
        await projectCrowdfund.connect(address1).deactivate();
        await projectCrowdfund.connect(address1).destroy();
        expect(await projectCrowdfundFactory.projectsCount()).to.equal(0);
      });
    });

    describe('Negative Outcomes', function () {
      it('Should NOT create new ProjectCrowdfund if target is not set', async function () {
        await expect(
          projectCrowdfundFactory.connect(address1).createProjectCrowdfund(0)
        ).to.be.revertedWithCustomError(
          projectCrowdfundFactory,
          'NeedsMoreThanZero'
        );
        expect(await projectCrowdfundFactory.projectsCount()).to.equal(0);
      });

      it('Should NOT remove project if function is called NOT by project owner', async function () {
        await projectCrowdfundFactory
          .connect(address1)
          .createProjectCrowdfund(50);
        expect(await projectCrowdfundFactory.projectsCount()).to.equal(1);

        projectCrowdfund = ProjectCrowdfund.attach(
          projectCrowdfundFactory.projects(0)
        );
        await expect(
          projectCrowdfund.connect(address2).destroy()
        ).to.be.revertedWith('Not owner');
        expect(await projectCrowdfundFactory.projectsCount()).to.equal(1);
      });
    });
  });

  describe('ProjectCrowdfund', function () {
    describe('Positive Outcomes', function () {
      it('Should create new ProjectCrowdfund contract with correct values', async function () {
        projectCrowdfund = await ProjectCrowdfund.deploy(
          projectCrowdfundFactory.address,
          address1.address,
          100
        );
        expect(await projectCrowdfund.factory()).to.equal(
          projectCrowdfundFactory.address
        );
        expect(await projectCrowdfund.owner()).to.equal(address1.address);
        expect(await projectCrowdfund.target()).to.equal(100);
        expect(await projectCrowdfund.isContributor(address1.address)).to.equal(
          true
        );

        let contributor = await projectCrowdfund.contributor(address1.address);
        expect(await contributor.contributor).to.equal(address1.address);
        expect(await projectCrowdfund.contributorsCount()).to.equal(1);
      });

      it('Should edit target', async function () {
        projectCrowdfund = await ProjectCrowdfund.deploy(
          projectCrowdfundFactory.address,
          address2.address,
          100
        );
        expect(await projectCrowdfund.target()).to.equal(100);

        await projectCrowdfund.connect(address2).editTarget(110);
        expect(await projectCrowdfund.target()).to.equal(110);
      });

      it('Should add contributor and increment contributors count', async function () {
        projectCrowdfund = await ProjectCrowdfund.deploy(
          projectCrowdfundFactory.address,
          address2.address,
          100
        );
        await projectCrowdfund
          .connect(address2)
          .addContributor(address1.address);

        expect(await projectCrowdfund.contributorsCount()).to.equal(2);

        let contributor = await projectCrowdfund.contributor(address2.address);
        expect(await contributor.contributor).to.equal(address2.address);

        contributor = await projectCrowdfund.contributor(address1.address);
        expect(await contributor.contributor).to.equal(address1.address);
      });

      it('Should remove contributor and decrement contributors count', async function () {
        projectCrowdfund = await ProjectCrowdfund.deploy(
          projectCrowdfundFactory.address,
          address2.address,
          100
        );
        await projectCrowdfund
          .connect(address2)
          .addContributor(address1.address);

        let contributor = await projectCrowdfund.contributor(address1.address);
        expect(contributor.contributor).to.equal(address1.address);
        expect(await projectCrowdfund.contributorsCount()).to.equal(2);

        await projectCrowdfund
          .connect(address2)
          .removeContributor(address1.address);
        expect(await projectCrowdfund.contributorsCount()).to.equal(1);
      });

      it('Should fund contract and set sponsored amount for sponsor', async function () {
        projectCrowdfund = await ProjectCrowdfund.deploy(
          projectCrowdfundFactory.address,
          address2.address,
          100
        );
        await address1.sendTransaction({
          to: projectCrowdfund.address,
          value: 50
        });
        await address2.sendTransaction({
          to: projectCrowdfund.address,
          value: 50
        });
        expect(await projectCrowdfund.sponsorsCount()).to.equal(2);
      });

      it('Should fund contract and append existing amount to sponsor if already a sponsor', async function () {
        projectCrowdfund = await ProjectCrowdfund.deploy(
          projectCrowdfundFactory.address,
          address2.address,
          100
        );
        await address1.sendTransaction({
          to: projectCrowdfund.address,
          value: 50
        });
        await address1.sendTransaction({
          to: projectCrowdfund.address,
          value: 50
        });

        let sponsor = await projectCrowdfund.sponsor(address1.address);
        expect(await sponsor.sponsor).to.equal(address1.address);
        expect(await sponsor.sponsoredAmount).to.equal(100);
        expect(await projectCrowdfund.sponsorsCount()).to.equal(1);
      });

      it('Should unlock amount and set new next unlock time', async function () {
        projectCrowdfund = await ProjectCrowdfund.deploy(
          projectCrowdfundFactory.address,
          address2.address,
          100
        );
        await address1.sendTransaction({
          to: projectCrowdfund.address,
          value: 300
        });
        expect(await projectCrowdfund.unlockedAmount()).to.equal(0);
        expect(
          await ethers.provider.getBalance(projectCrowdfund.address)
        ).to.equal(300);
        expect(await projectCrowdfund.getBalance()).to.equal(300);

        let week = 7 * 24 * 60 * 60;
        await time.increase(week);

        await projectCrowdfund.connect(address2).unclockAmount();
        await expect(
          projectCrowdfund.connect(address2).unclockAmount()
        ).to.be.revertedWith('Unlock time has not passed');
        expect(await projectCrowdfund.unlockedAmount()).to.equal(100);

        await time.increase(week);
        await projectCrowdfund.connect(address2).unclockAmount();
        await expect(
          projectCrowdfund.connect(address2).unclockAmount()
        ).to.be.revertedWith('Unlock time has not passed');
        expect(await projectCrowdfund.unlockedAmount()).to.equal(200);

        await time.increase(week);
        await projectCrowdfund.connect(address2).unclockAmount();
        await expect(
          projectCrowdfund.connect(address2).unclockAmount()
        ).to.be.revertedWith('Unlock time has not passed');
        await time.increase(week);
        await expect(
          projectCrowdfund.connect(address2).unclockAmount()
        ).to.be.revertedWith('No remaining funds to unlock');
        expect(await projectCrowdfund.unlockedAmount()).to.equal(300);
      });

      it('Should distribute funds to contributors', async function () {
        projectCrowdfund = await ProjectCrowdfund.deploy(
          projectCrowdfundFactory.address,
          address2.address,
          100
        );
        await address1.sendTransaction({
          to: projectCrowdfund.address,
          value: 300
        });
        await projectCrowdfund
          .connect(address2)
          .addContributor(address1.address);
        await projectCrowdfund
          .connect(address2)
          .addContributor(address3.address);
        await projectCrowdfund.connect(address2).addContributor(owner.address);

        let week = 7 * 24 * 60 * 60;
        await time.increase(week);
        let contributorBalance = await address1.getBalance();
        let contributorsCount = await projectCrowdfund.contributorsCount();
        await projectCrowdfund.connect(address2).unclockAmount();
        let unlockedAmount = await projectCrowdfund.unlockedAmount();
        await projectCrowdfund.connect(address2).distribute();
        expect(await address1.getBalance()).to.equal(
          contributorBalance.add(unlockedAmount / contributorsCount)
        );
      });

      it('Should deactivate project', async function () {
        projectCrowdfund = await ProjectCrowdfund.deploy(
          projectCrowdfundFactory.address,
          address2.address,
          100
        );
        expect(await projectCrowdfund.active()).to.equal(true);

        await projectCrowdfund.connect(address2).deactivate();
        expect(await projectCrowdfund.active()).to.equal(false);
      });

      it('Should activate inactive project', async function () {
        projectCrowdfund = await ProjectCrowdfund.deploy(
          projectCrowdfundFactory.address,
          address2.address,
          100
        );
        expect(await projectCrowdfund.active()).to.equal(true);

        await projectCrowdfund.connect(address2).deactivate();
        expect(await projectCrowdfund.active()).to.equal(false);

        await projectCrowdfund.connect(address2).activate();
        expect(await projectCrowdfund.active()).to.equal(true);
      });

      it('Should get project summary and match data', async function () {
        projectCrowdfund = await ProjectCrowdfund.deploy(
          projectCrowdfundFactory.address,
          address2.address,
          100
        );
        let summary = await projectCrowdfund.getSummary();
        expect(summary[0]).to.equal(address2.address);
        expect(summary[1]).to.equal(await projectCrowdfund.address);
        expect(summary[2]).to.equal(await projectCrowdfund.getBalance());
        expect(summary[3]).to.equal(100);
        expect(summary[4]).deep.eq([]);
        expect(summary[5]).to.equal(0);
        expect(summary[6]).deep.eq([
          await projectCrowdfund.contributor(address2.address)
        ]);
        expect(summary[7]).to.equal(1);
      });

      it('Should destroy project and send funds to owner', async function () {
        projectCrowdfund = await ProjectCrowdfund.deploy(
          projectCrowdfundFactory.address,
          address2.address,
          100
        );
        await address1.sendTransaction({
          to: projectCrowdfund.address,
          value: ethers.utils.parseEther('50')
        });
        await projectCrowdfund.connect(address2).deactivate();

        let addressBalance = await address2.getBalance();
        await projectCrowdfund.connect(address2).destroy();
        let latestBalance = await address2.getBalance();
        expect(latestBalance.div(10e14)).to.equal(
          addressBalance.add(ethers.utils.parseEther('50')).div(10e14)
        );
      });
    });

    describe('Negative Outcomes', function () {
      it('Should NOT add contributor if initiator is not owner', async function () {
        projectCrowdfund = await ProjectCrowdfund.deploy(
          projectCrowdfundFactory.address,
          address2.address,
          100
        );
        await expect(
          projectCrowdfund.connect(address1).addContributor(address1.address)
        ).to.be.revertedWith('Not owner');
      });

      it('Should NOT add contributor if contributor already exist', async function () {
        projectCrowdfund = await ProjectCrowdfund.deploy(
          projectCrowdfundFactory.address,
          address2.address,
          100
        );
        await projectCrowdfund
          .connect(address2)
          .addContributor(address1.address);
        await expect(
          projectCrowdfund.connect(address2).addContributor(address1.address)
        ).to.be.revertedWith('Already a contributor');
      });

      it('Should NOT remove contributor if contributor does not exist', async function () {
        projectCrowdfund = await ProjectCrowdfund.deploy(
          projectCrowdfundFactory.address,
          address2.address,
          100
        );
        await expect(
          projectCrowdfund.connect(address2).removeContributor(address1.address)
        ).to.be.revertedWith('Not a contributor');
      });

      it('Should NOT remove contributor if contributor is owner', async function () {
        projectCrowdfund = await ProjectCrowdfund.deploy(
          projectCrowdfundFactory.address,
          address2.address,
          100
        );
        await expect(
          projectCrowdfund.connect(address2).removeContributor(address2.address)
        ).to.be.revertedWith('Cannot remove owner');
      });

      it('Should NOT remove contributor if initiator is not owner', async function () {
        projectCrowdfund = await ProjectCrowdfund.deploy(
          projectCrowdfundFactory.address,
          address2.address,
          100
        );
        await projectCrowdfund
          .connect(address2)
          .addContributor(address1.address);
        await expect(
          projectCrowdfund.connect(address1).removeContributor(address1.address)
        ).to.be.revertedWith('Not owner');
      });

      it('Should NOT unlock amount if unlock period not passed', async function () {
        projectCrowdfund = await ProjectCrowdfund.deploy(
          projectCrowdfundFactory.address,
          address2.address,
          100
        );
        await address1.sendTransaction({
          to: projectCrowdfund.address,
          value: 300
        });
        expect(await projectCrowdfund.unlockedAmount()).to.equal(0);
        expect(
          await ethers.provider.getBalance(projectCrowdfund.address)
        ).to.equal(300);
        expect(await projectCrowdfund.getBalance()).to.equal(300);

        await expect(
          projectCrowdfund.connect(address2).unclockAmount()
        ).to.be.revertedWith('Unlock time has not passed');
      });

      it('Should NOT unlock amount if balance is zero', async function () {
        projectCrowdfund = await ProjectCrowdfund.deploy(
          projectCrowdfundFactory.address,
          address2.address,
          100
        );
        expect(await projectCrowdfund.unlockedAmount()).to.equal(0);
        expect(await projectCrowdfund.getBalance()).to.equal(0);

        let week = 7 * 24 * 60 * 60;
        await time.increase(week);
        await expect(
          projectCrowdfund.connect(address2).unclockAmount()
        ).to.be.revertedWithCustomError(projectCrowdfund, 'NeedsMoreThanZero');
      });

      it('Should NOT unlock if remaining funds to unlock is zero', async function () {
        projectCrowdfund = await ProjectCrowdfund.deploy(
          projectCrowdfundFactory.address,
          address2.address,
          100
        );
        await address1.sendTransaction({
          to: projectCrowdfund.address,
          value: 100
        });
        expect(await projectCrowdfund.unlockedAmount()).to.equal(0);
        expect(await projectCrowdfund.getBalance()).to.equal(100);

        let week = 7 * 24 * 60 * 60;
        await time.increase(week);
        await projectCrowdfund.connect(address2).unclockAmount();
        await time.increase(week);
        await expect(
          projectCrowdfund.connect(address2).unclockAmount()
        ).to.be.revertedWith('No remaining funds to unlock');
      });

      it('Should NOT deactivate project if not owner', async function () {
        projectCrowdfund = await ProjectCrowdfund.deploy(
          projectCrowdfundFactory.address,
          address2.address,
          100
        );
        await expect(
          projectCrowdfund.connect(address1).deactivate()
        ).to.be.revertedWith('Not owner');
      });

      it('Should NOT activate project if not owner', async function () {
        projectCrowdfund = await ProjectCrowdfund.deploy(
          projectCrowdfundFactory.address,
          address2.address,
          100
        );
        await projectCrowdfund.connect(address2).deactivate();
        await expect(
          projectCrowdfund.connect(address1).activate()
        ).to.be.revertedWith('Not owner');
      });

      it('Should NOT destroy project if not owner', async function () {
        projectCrowdfund = await ProjectCrowdfund.deploy(
          projectCrowdfundFactory.address,
          address2.address,
          100
        );
        await projectCrowdfund.connect(address2).deactivate();
        await expect(
          projectCrowdfund.connect(address1).destroy()
        ).to.be.revertedWith('Not owner');
      });

      it('Should NOT destroy project if active', async function () {
        projectCrowdfund = await ProjectCrowdfund.deploy(
          projectCrowdfundFactory.address,
          address2.address,
          100
        );
        await expect(
          projectCrowdfund.connect(address2).destroy()
        ).to.be.revertedWith('Status is active');
      });
    });
  });
});
