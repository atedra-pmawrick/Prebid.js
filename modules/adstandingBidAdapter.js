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
    const impressions = [];

    var site = null;
    var app = null;
    var device = null;

    const request = {
      id: bidderRequest.auctionId,
      imp: impressions,
      cur: config.getConfig('currency.adServerCurrency'),
      ext: {
        refererInfo: bidderRequest.refererInfo,
      }
    };

    validBidRequests.forEach(bid => {
      const impression = { id: bid.bidId, ext: bid };
      if (bid.mediaTypes.banner) {
        const banner = {
          id: bid.bidId,
          format: []
        };
        bid.mediaTypes.banner.sizes.forEach(size => {
          banner.format.push({ w: size[0], h: size[1] });
        })
        impression.banner = banner;
      } else if (bid.mediaTypes.video) {
        const video = utils.deepAccess(bid, 'params.video') || {};
        impression.video = video;
      }
      if (utils.deepAccess(bid, 'params.site')) {
        site = utils.deepAccess(bid, 'params.site');
      }
      if (utils.deepAccess(bid, 'params.app')) {
        app = utils.deepAccess(bid, 'params.app');
      }
      if (utils.deepAccess(bid, 'params.device')) {
        device = utils.deepAccess(bid, 'params.device');
      }

      impressions.push(impression)
    })

    if (site) {
      request.site = site;
    }
    if (app) {
      request.app = app;
    }
    if (device) {
      request.device = device;
    }

    return {
      method: 'POST',
      url: `//${DOMAIN}/ssp/prebid/bid`,
      data: request
    };
  },

  interpretResponse: (serverResponse, request) => {
    utils.logMessage('interpretResponse')
    const bidResponses = [];

    let serverBidResponse = serverResponse.body;

    if (serverBidResponse.seatbid) {
      serverBidResponse.seatbid.forEach(seatbid => {
        seatbid.bid.forEach(bid => {
          let bidResponse = {
            requestId: bid.impid,
            cpm: bid.price,
            creativeId: bid.crid,
            dealId: bid.dealid,
            currency: serverBidResponse.cur,
            netRevenue: true,
            ttl: 360
          };

          if (request.mediaType == VIDEO) {
            bidResponse.vastUrl = bid.adm;
          } else {
            bidResponse.width = bid.w;
            bidResponse.height = bid.h;
            bidResponse.ad = bid.adm;
          }

          bidResponses.push(bidResponse);
        })
      })
    }

    return bidResponses;
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
