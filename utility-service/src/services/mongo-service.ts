import { CHILD_API_STATUS } from "@/constants/download.constants";
import { COMPARATOR_CHILD_STATUS } from "@/constants/files-comparator.constants";
import { FileComparatorChildDataRes } from "@/interfaces/comparator-accumulator.interface";
import ComparatorChildReq from "@/models/mongo/comparator-child-req.schema";
import DownloadChildReq from "@/models/mongo/download-child-req.schema";
import { Service } from "typedi";

@Service()
export default class MongoService {
  public async getDownloadChildData(
    parentReqId: string,
    lastIndexUpdatedAt: string,
    docCount: number
  ): Promise<any> {
    if (!lastIndexUpdatedAt) {
      const childApiData = await DownloadChildReq.find(
        {
          parentReqId,
          status: CHILD_API_STATUS.COMPLETED,
        },
        { sequenceNo: 1, apiResponse: 1, _id: 1 }
      )
        .sort({ _id: 1 })
        .limit(docCount)
        .lean();

      if (!childApiData?.length) {
        return { childApiData, lastIndexUpdatedAt };
      }
      lastIndexUpdatedAt = childApiData[childApiData.length - 1]._id;
      return { childApiData, lastIndexUpdatedAt };
    }
    const childApiData = await DownloadChildReq.find(
      {
        parentReqId,
        status: CHILD_API_STATUS.COMPLETED,
        _id: { $gt: lastIndexUpdatedAt },
      },
      { sequenceNo: 1, apiResponse: 1, _id: 1 }
    )
      .sort({ _id: 1 })
      .limit(docCount)
      .lean();
    if (!childApiData?.length) {
      return { childApiData, lastIndexUpdatedAt };
    }
    lastIndexUpdatedAt = childApiData[childApiData.length - 1]._id;
    return { childApiData, lastIndexUpdatedAt };
  }

  public async getFileComparatorChildData(
    parentReqId: string,
    nextCursor: string,
    docCount: number
  ): Promise<FileComparatorChildDataRes> {
    const filterQuery: any = {
      parentReqId,
      status: { $ne: COMPARATOR_CHILD_STATUS.MATCHED },
    };
    if (nextCursor) {
      filterQuery._id = { $gt: nextCursor };
    }
    const childData = await ComparatorChildReq.find(filterQuery, {
      comparatorValue: 1,
      rowData: 1,
      status: 1,
      validationErrors: 1,
    })
      .sort({ _id: 1 })
      .limit(docCount)
      .lean();

    if (!childData?.length) {
      return { childData: [], nextCursor: null };
    }
    nextCursor =
      childData.length === docCount
        ? childData[childData.length - 1]._id
        : null;
    return {
      childData,
      nextCursor,
    };
  }
}
