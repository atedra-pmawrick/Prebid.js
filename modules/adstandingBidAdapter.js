import { registerBidder } from '../src/adapters/bidderFactory';
import { BANNER, VIDEO } from '../src/mediaTypes';
import { config } from 'src/config';

const BIDDER_CODE = 'adstanding';
const URL = '//rtb-dev.test.adstanding.com/ssp/prebid/bid';
const URL_SYNC = '//rtb-dev.test.adstanding.com/ssp/prebid/cookie';

export const spec = {
  code: BIDDER_CODE,
  supportedMediaTypes: [BANNER, VIDEO],

  isBidRequestValid: (bid) => {
    return true;
  },

  buildRequests: (validBidRequests, bidderRequest) => {
    let request = {
      'bidRequests': validBidRequests,
      'refererInfo': bidderRequest.refererInfo,
      'currency': config.getConfig(currency),
    };
    return {
      method: 'POST',
      url: URL,
      data: request
    };
  },

  interpretResponse: (serverResponse) => {
    const bidResponses = [];

    let serverBidResponse = serverResponse.body;

    serverBidResponse.seatbid.forEach(seatbid => {
      seatbid.bid.forEach(bid => {
        let bidRequest = bid.ext.bidRequest;

        let bidResponse = {
          requestId: bid.id,
          cpm: bid.price,
          creativeId: bid.crid,
          dealId: bid.dealid,
          currency: serverBidResponse.cur,
          netRevenue: true,
          ttl: 360
        };

        if (bidRequest.mediaType == VIDEO) {
          bidResponse.vastUrl = bid.adm
        } else {
          bidResponse.width = bid.w
          bidResponse.height = bid.h
          bidResponse.ad = bid.adm
        }

        if (isBidResponseValid(bidResponse)) {
          bidResponses.push(bidResponse);
        }
      })
    })

    return bidResponses;
  },

  getUserSyncs: (syncOptions, serverResponses) => {
    return [{
      type: 'image',
      url: URL_SYNC
    }];
  }

};

registerBidder(spec);
