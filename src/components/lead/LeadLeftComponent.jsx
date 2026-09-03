import { CommonHexagonBadge } from "@/partials/common";
const LeadLeftComponent = () => {
  return (
    <div className="h-full lg:border-e lg:border-e-border shrink-0 p-4 lg:p-7 bg-muted/15">
      <h6 className="flex items-center justify-between font-bold text-gray-900 mb-4">
        Lead Details
        <CommonHexagonBadge
          stroke="stroke-success"
          fill="fill-light"
          size="size-[38px]"
          badge={<i className="ki-filled ki-ki-filled ki-abstract-18 text-lg text-success"></i>}
        />
      </h6>
      <div className="flex flex-col flex-wrap gap-1.5">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="badge badge-sm badge-pill badge-secondary text-xs"
            title="Stage"
          >
            L-169
          </div>
          <div className="text-lg font-medium text-gray-900">Sanjay Parmar</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-700">Pipeline:</div>
          <div className="text-md font-medium text-gray-900">Aales Pipeline</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-700">Stage:</div>
          <div className="text-md font-medium text-gray-900">New Inquiry</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-700">Stage Remark:</div>
          <div className="text-md font-medium text-gray-900">NA</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-700">Assigned To:</div>
          <div className="text-md font-medium text-gray-900">VT Viddhi Thakkar</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-700">Source:</div>
          <div className="text-md font-medium text-gray-900">Facebookr</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-700">Closing Date:</div>
          <div className="text-md font-medium text-gray-900">NA</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-700">Amount:</div>
          <div className="text-md font-medium text-gray-900">NA</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-700">Description:</div>
          <div className="text-md font-medium text-gray-900">He will call back in 10 min Details shared</div>
        </div>
      </div>      
      <hr className="border-t border-gray-200 my-5" />
      <h6 className="flex items-center justify-between font-bold text-gray-900 mb-4">
        Contact Details
        <CommonHexagonBadge
          stroke="stroke-success"
          fill="fill-light"
          size="size-[38px]"
          badge={<i className="ki-filled ki-book-open text-lg text-success"></i>}
        />
      </h6>
      <div className="flex flex-col flex-wrap gap-1.5">
        <div className="flex items-center gap-2">
          <i className="ki-filled ki-user text-success"></i>
          <div className="text-sm text-gray-700">Sample Name</div>
        </div>
        <div className="flex items-center gap-2">
          <i className="ki-filled ki-ki-filled ki-sms text-success"></i>
          <div className="text-sm text-gray-700">sample@gmail.com</div>
        </div>
        <div className="flex items-center gap-2">
          <i className="ki-filled ki-call text-success"></i>
          <div className="text-sm text-gray-700">+91 9876554321</div>
        </div>
      </div>
      <hr className="border-t border-gray-200 my-5" />
      <h6 className="flex items-center justify-between font-bold text-gray-900 mb-4">
        Company Details
        <CommonHexagonBadge
          stroke="stroke-success"
          fill="fill-light"
          size="size-[38px]"
          badge={<i className="ki-filled ki-bank text-lg text-success"></i>}
        />
      </h6>
      <div className="flex flex-col flex-wrap gap-1.5">
        <div className="flex items-center gap-2">
          <i className="ki-filled ki-user text-success"></i>
          <div className="text-sm text-gray-700">Sample Name</div>
        </div>
      </div>
      
      <hr className="border-t border-gray-200 my-5" />
      <div className="flex flex-col flex-wrap gap-1.5">
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-700">Last modified:</div>
          <div className="text-md font-medium text-gray-900">about a month ago</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-700">Lead created at:</div>
          <div className="text-md font-medium text-gray-900">about a month ago</div>
        </div>
      </div>

      <hr className="border-t border-gray-200 my-5" />
      <h6 className="font-bold text-gray-900 mb-4 flex items-center justify-between">Tags <button className="btn btn-success w-8 h-8 p-0 inline-flex items-center justify-center rounded-full" title="Add Tag"><i className="ki-filled ki-plus"></i></button></h6>
      <div className="flex flex-wrap gap-1.5">
          <button className="btn btn-light h-7 rounded-full px-3" title="Lead">Lead <span className="ki-filled ki-cross text-sm"></span></button>
          <button className="btn btn-light h-7 rounded-full px-3" title="Sample">Sample <span className="ki-filled ki-cross text-sm"></span></button>
          <button className="btn btn-light h-7 rounded-full px-3" title="Demo">Demo <span className="ki-filled ki-cross text-sm"></span></button>
      </div>
    </div>
  );
};

export { LeadLeftComponent };
