'use strict';

require('./helper');

const { expect } = require('chai'),
  DataTypes = require('../source'),
  sinon = require('sinon');

describe('Instance', () => {
  before(function () {
    this.clock = sinon.useFakeTimers();
  });

  afterEach(function () {
    this.clock.reset();
  });

  after(function () {
    this.clock.restore();
  });

  beforeEach(async function () {
    this.User = this.sequelize.define('User', {
      username: { type: DataTypes.STRING },
      uuidv1: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV1 },
      uuidv4: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
      touchedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      aNumber: { type: DataTypes.INTEGER },
      bNumber: { type: DataTypes.INTEGER },
      aDate: { type: DataTypes.DATE },

      validateTest: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { isInt: true }
      },
      validateCustom: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: { len: { msg: 'Length failed.', args: [1, 20] } }
      },

      dateAllowNullTrue: {
        type: DataTypes.DATE,
        allowNull: true
      },

      isSuperUser: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    });

    await this.User.sync({ force: true });
  });

  describe('increment', () => {
    beforeEach(async function () {
      await this.User.create({ id: 1, aNumber: 0, bNumber: 0 });
    });

    // Edited test. This test originally relies on a predictable id as PK.
    it('with timestamps set to true and options.silent set to true', async function () {
      const User = this.sequelize.define(
        'IncrementUser',
        {
          aNumber: DataTypes.INTEGER
        },
        { timestamps: true }
      );

      await User.sync({ force: true });
      // This part differs from original Sequelize test.
      // Added id: 1 because this test expects pk to be 1, and
      // CRDB does not guarantee ids start at 1.
      const user = await User.create({ id: 1, aNumber: 1 });
      const oldDate = user.updatedAt;
      this.clock.tick(1000);
      await user.increment('aNumber', { by: 1, silent: true });

      // Removed .eventually method, from chai-as-promised.
      const foundUser = await User.findByPk(1);
      await expect(foundUser)
        .to.have.property('updatedAt')
        .equalTime(oldDate);
    });
  });
});
