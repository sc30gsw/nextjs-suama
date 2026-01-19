import { AppealModel } from '~/features/report-contexts/appeals/api/model'
import { TroubleModel } from '~/features/report-contexts/troubles/api/model'
import { DailyReportModel } from '~/features/reports/daily/api/model'

export type AppealCategoriesResponse = AppealModel.getAppealCategoriesResponse

export type TroubleCategoriesResponse = TroubleModel.getTroubleCategoriesResponse

export type WorkContentResponse =
  DailyReportModel.getDailyReportsResponse['dailyReports'][number]['workContents'][number]
