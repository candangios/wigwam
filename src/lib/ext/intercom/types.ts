export enum IntercomMessageType {
  Req = "INTERCOM_REQUEST",
  Res = "INTERCOM_RESPONSE",
  Err = "INTERCOM_ERROR",
  Void = "INTERCOM_VOID",
}

export type IntercomClientMessage = IntercomRequest | IntercomVoid;

export type IntercomServerMessage =
  | IntercomResponse
  | IntercomErrorResponse
  | IntercomVoid;

export interface IntercomMessageBase {
  type: IntercomMessageType;
  data: any;
}

export interface IntercomReqResBase extends IntercomMessageBase {
  type:
    | IntercomMessageType.Req
    | IntercomMessageType.Res
    | IntercomMessageType.Err;
  reqId: number;
}

export interface IntercomRequest extends IntercomReqResBase {
  type: IntercomMessageType.Req;
}

export interface IntercomResponse extends IntercomReqResBase {
  type: IntercomMessageType.Res;
}

export interface IntercomErrorResponse extends IntercomReqResBase {
  type: IntercomMessageType.Err;
}

export interface IntercomVoid extends IntercomMessageBase {
  type: IntercomMessageType.Void;
}