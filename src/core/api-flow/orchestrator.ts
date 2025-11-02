import axios from "axios";

export interface IStepExecution {
  name: string;
  description: string;
  executeOn: "always" | "HTTP_1xx" | "HTTP_2xx" | "HTTP_3xx" | "HTTP_4xx" | "HTTP_5xx" | IGenericCallBack;
  method: "GET" | "POST" | "DELETE" | "PUT";
  transactionUrl: string;
  complementingTransactionUrl?: string;
  executeComplementingTransaction?: "HTTP_1xx" | "HTTP_2xx" | "HTTP_3xx" | "HTTP_4xx" | "HTTP_5xx" | IGenericCallBack | undefined;
  status?: "COMPLETED_SUCCESS" | "COMPLETED_FAILURE" | "COMPLETED_COMPLEMENTING" | "NO_STARTED" | "IN_EXECTION";
  next?: IStepExecution;
  parallel?: IStepExecution[] | undefined;
  payload?: any;
  authorization?: any;
  repeat?: number;
}

export interface IGenericCallBack {
  callback: any;
}

export interface IFlowExecution {
  startTransaction: IStepExecution;
  executeOn: "CREATE" | "UPDATE" | "DELETE" | "GET";
  failureNotice?: any;
  executionCallBack?: any;
  payLoadMappingCallBack?: any;
  changeUrlCallBack?: any;
  repeatConfirmationCallBack?: any;
  canExecuteCallBack?: any;
}

export interface ITransactionExecutionResult {
  transactionName: string;
  transactionUrl: string;
  http_status_code: any;
  http_status_message: string;
  http_response: any;
}

export interface IChangeTransactionURLAndMethod {
  transactionUrl: string;
  transactionMethod: "GET" | "POST" | "DELETE" | "PUT";
}

export function api_orchestrator(
  action: string,
  execute: IFlowExecution,
  authorization?: any
): any {
  if (action === execute.executeOn) {
    executeAPI(
      execute.startTransaction,
      authorization,
      execute.executionCallBack,
      execute.payLoadMappingCallBack,
      execute.changeUrlCallBack,
      execute.repeatConfirmationCallBack,
      undefined,
      execute.canExecuteCallBack
    );
  }
}

export function executeAPI(
  step: IStepExecution,
  authorization: any,
  execution_callback?: any,
  payload_callback?: any,
  changeUrlCallBack?: any,
  repeatConfirmationCallBack?: any,
  prev_result?: ITransactionExecutionResult,
  canExeuteStep?: any
) {
  if (step.executeOn === "always") {
    !step.payload && payload_callback && (step.payload = payload_callback(step.name, prev_result));

    const changedUrl: IChangeTransactionURLAndMethod = changeUrlCallBack
      ? changeUrlCallBack(step.name, step.transactionUrl, step.method, prev_result, step.payload)
      : undefined;
    if (changedUrl) {
      step.transactionUrl = changedUrl.transactionUrl;
      step.method = changedUrl.transactionMethod;
    }

    !step.authorization ? (step.authorization = authorization) : undefined;

    canExecute(step, canExeuteStep)
      ? Promise.resolve(makeAPICall(step, authorization, payload_callback, prev_result, canExeuteStep, changeUrlCallBack))
          .then((response: any) => {
            let nextStepToExecute: IStepExecution | undefined = undefined;
            execution_callback && execution_callback(step.name, "Completed", response);

            if (repeatConfirmationCallBack) {
              if (repeatConfirmationCallBack(step.name, response)) {
                nextStepToExecute = step;
                payload_callback && (step.payload = payload_callback(step.name, prev_result));
              } else {
                nextStepToExecute = step.next;
              }
            } else {
              nextStepToExecute = step.next;
            }

            nextStepToExecute && executeAPI(
              nextStepToExecute,
              authorization,
              execution_callback,
              payload_callback,
              changeUrlCallBack,
              repeatConfirmationCallBack,
              response,
              canExeuteStep
            );
          })
          .catch((response: any) => {
            execution_callback && execution_callback(step.name, "Failed", response);
          })
      : (execution_callback && execution_callback(step.name, "Skipped", {}),
        step.next && executeAPI(
          step.next,
          authorization,
          execution_callback,
          payload_callback,
          changeUrlCallBack,
          repeatConfirmationCallBack,
          undefined,
          canExeuteStep
        ));
  }
}

function canExecute(step: IStepExecution, canExeuteStep?: any): boolean {
  if (step.method == "PUT" || step.method == "POST") {
    if (!step.payload) return false;
  }
  if (!step.authorization) return false;
  if (canExeuteStep) return canExeuteStep(step.name);
  return true;
}

function makeAPICall(
  step: IStepExecution,
  authorization: any,
  payload_callback?: any,
  prev_result?: ITransactionExecutionResult,
  canExecuteCallBack?: any,
  changeUrlCallBack?: any
): any {
  const parallelPromise = [];

  switch (step.method) {
    case "GET":
      parallelPromise.push(axios.get(step.transactionUrl, step.authorization).catch(useNull));
      break;
    case "POST":
      parallelPromise.push(axios.post(step.transactionUrl, step.payload, step.authorization).catch(useNull));
      break;
    case "DELETE":
      parallelPromise.push(axios.delete(step.transactionUrl, step.authorization).catch(useNull));
      break;
    case "PUT":
      parallelPromise.push(axios.put(step.transactionUrl, step.payload, step.authorization).catch(useNull));
  }

  return axios.all(parallelPromise).then(
    axios.spread((...args) => {
      const results: ITransactionExecutionResult[] = [];
      for (let iCount = 0; iCount < args.length; iCount++) {
        if (args[iCount] != null) {
          results.push({
            http_status_code: args[iCount]!.status,
            http_status_message: args[iCount]!.statusText,
            http_response: args[iCount]!.data,
            transactionName: step.name,
            transactionUrl: args[iCount]!.request.responseURL,
          });
        }
      }
      return results[0];
    })
  );
}

function useNull() {
  return null;
}
