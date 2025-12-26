import { and, asc, count, desc, eq, like, or } from 'drizzle-orm'
import { QUERY_DEFAULT_PARAMS } from '~/constants'
import { clients, projects } from '~/db/schema'
import { getDb } from '~/index'
import type { ProjectModel } from '~/features/report-contexts/projects/api/model'
import {
  ProjectServiceError,
  ProjectNotFoundError,
} from '~/features/report-contexts/projects/api/errors'

export abstract class ProjectService {
  static async getProjects(params: ProjectModel.getProjectsQuery) {
    try {
      const db = getDb()
      const { skip, limit, names, archiveStatus, sortBy, sortOrder } = params

      const skipNumber = Number(skip) || QUERY_DEFAULT_PARAMS.SKIP
      const namesArray = names ? names.split(',').map((name) => name.trim()) : []
      const nameConditions =
        namesArray.length > 0
          ? or(
              ...namesArray.flatMap((word) => [
                like(projects.name, `%${word}%`),
                like(projects.likeKeywords, `%${word}%`),
                like(clients.name, `%${word}%`),
                like(clients.likeKeywords, `%${word}%`),
              ]),
            )
          : undefined

      const archiveCondition =
        archiveStatus === 'active'
          ? eq(projects.isArchived, false)
          : archiveStatus === 'archived'
            ? eq(projects.isArchived, true)
            : undefined

      const whereClause =
        archiveCondition && nameConditions
          ? and(archiveCondition, nameConditions)
          : archiveCondition
            ? archiveCondition
            : nameConditions

      const totalResult = await db
        .select({ count: count() })
        .from(projects)
        .innerJoin(clients, eq(projects.clientId, clients.id))
        .where(whereClause)
      const total = totalResult[0].count

      const limitNumber = Number(limit) || total

      const projectList = await db
        .select({
          id: projects.id,
          name: projects.name,
          likeKeywords: projects.likeKeywords,
          isArchived: projects.isArchived,
          clientId: projects.clientId,
          createdAt: projects.createdAt,
          updatedAt: projects.updatedAt,
          clientName: clients.name,
          clientLikeKeywords: clients.likeKeywords,
          clientCreatedAt: clients.createdAt,
          clientUpdatedAt: clients.updatedAt,
        })
        .from(projects)
        .innerJoin(clients, eq(projects.clientId, clients.id))
        .where(whereClause)
        .orderBy(
          ...(() => {
            const orderByArray: ReturnType<typeof asc>[] = []

            if (sortBy && sortOrder) {
              if (sortBy === 'name') {
                orderByArray.push(sortOrder === 'asc' ? asc(projects.name) : desc(projects.name))
              } else if (sortBy === 'status') {
                orderByArray.push(
                  sortOrder === 'asc' ? asc(projects.isArchived) : desc(projects.isArchived),
                )
              } else if (sortBy === 'clientName') {
                orderByArray.push(sortOrder === 'asc' ? asc(clients.name) : desc(clients.name))
              }
              orderByArray.push(asc(projects.isArchived))
            } else {
              orderByArray.push(asc(projects.isArchived))
            }

            orderByArray.push(asc(clients.name))
            orderByArray.push(asc(projects.name))

            return orderByArray
          })(),
        )
        .limit(limitNumber)
        .offset(skipNumber)

      const projectIds = projectList.map((p) => p.id)

      const missionsCount = await db.query.missions.findMany({
        where: (missionsTable, { inArray }) => inArray(missionsTable.projectId, projectIds),
        columns: {
          id: true,
          projectId: true,
        },
      })

      const missionsByProjectId = missionsCount.reduce(
        (acc, mission) => {
          if (!acc[mission.projectId]) {
            acc[mission.projectId] = []
          }
          acc[mission.projectId].push({ id: mission.id })
          return acc
        },
        {} as Record<string, Array<{ id: string }>>,
      )

      const formattedProjects = projectList.map((project) => ({
        id: project.id,
        name: project.name,
        likeKeywords: project.likeKeywords,
        isArchived: project.isArchived,
        clientId: project.clientId,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt?.toISOString() ?? null,
        client: {
          id: project.clientId,
          name: project.clientName,
          likeKeywords: project.clientLikeKeywords,
          createdAt: project.clientCreatedAt.toISOString(),
          updatedAt: project.clientUpdatedAt?.toISOString() ?? null,
        },
        missions: missionsByProjectId[project.id] ?? [],
      }))

      return {
        projects: formattedProjects,
        total,
        skip: skipNumber,
        limit: limitNumber,
      }
    } catch (error) {
      if (error instanceof ProjectServiceError || error instanceof ProjectNotFoundError) {
        throw error
      }
      throw new ProjectServiceError(
        `Failed to get projects: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}
