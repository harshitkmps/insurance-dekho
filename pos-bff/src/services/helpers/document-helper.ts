import { sendResponse } from "../../services/helpers/response-handler";
import { Controller, Post, Req, Res } from "@nestjs/common";
import DocumentService from "../../core/api-helpers/document-service";

@Controller("/v1/doc-service")
export class CommonDocController {
  constructor(private readonly documentService: DocumentService) {}

  @Post("/virtual-doc")
  async createUrlFromDocId(@Req() req: any, @Res() res: any) {
    const doc_urls = [];
    const modifiedDocId = req.body.doc_ids;
    const response = await this.documentService.addRegisterDocumentV2(
      req.headers,
      modifiedDocId,
      false
    );
    if (response.data.docs) {
      const docs = response.data.docs;
      docs.forEach((doc) => {
        const accessId = doc.access_id;
        doc_urls.push(
          process.env.DOC_SERVICE_URL + `doc-service/v1/documents/` + accessId
        );
      });
    }
    return sendResponse(req, res, 200, "links generated successful", doc_urls);
  }
}
