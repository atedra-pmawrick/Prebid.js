import * as utils from 'src/utils';
import { registerBidder } from '../src/adapters/bidderFactory';
import { BANNER, VIDEO } from '../src/mediaTypes';
import { config } from 'src/config';

const DOMAIN = 'rtb-dev.test.adstanding.com';

export const spec = {
  code: 'adstanding',
  aliases: ['atedra'],
  supportedMediaTypes: [BANNER, VIDEO],

  isBidRequestValid: (bid) => {
    utils.logMessage('isBidRequestValid')
    return true;
  },

  buildRequests: (validBidRequests, bidderRequest) => {
    const request = {
      bidderRequest: bidderRequest,
      bidRequests: validBidRequests,
      adServerCurrency: config.getConfig('currency.adServerCurrency'),
      refererInfo: bidderRequest.refererInfo
    };

    return {
      method: 'POST',
      url: `//${DOMAIN}/ssp/prebid/bid`,
      data: request
    };
  },

  interpretResponse: (serverResponse, request) => {
    return serverResponse.body;
  },

  getUserSyncs: (syncOptions, serverResponses) => {
    utils.logMessage('getUserSyncs')
    return [{
      type: 'image',
      url: `//${DOMAIN}/ssp/prebid/cookie`
    }];
  },

  /**
   * Register bidder specific code, which will execute if bidder timed out after an auction
   * @param {data} Containing timeout specific data
   */
  onTimeout: function(data) {
    // Bidder specifc code
    utils.logMessage('onTimeout')
  },

  /**
   * Register bidder specific code, which will execute if a bid from this bidder won the auction
   * @param {Bid} The bid that won the auction
   */
  onBidWon: function(bid) {
    // Bidder specific code
    utils.logMessage('onBidWon')
  },

  /**
   * Register bidder specific code, which will execute when the adserver targeting has been set for a bid from this bidder
   * @param {Bid} The bid of which the targeting has been set
   */
  onSetTargeting: function(bid) {
    // Bidder specific code
    utils.logMessage('onSetTargeting')
  }
};

registerBidder(spec);
