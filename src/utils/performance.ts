export type ProjectType = {
  proj_name: string;
  proj_no: string;
  total_area: number;
  data_level: string;
  managers: {
    manager: {
      name: string;
      certs: { company: { name: string }; experiences: { start_date: string; end_date: string }[] }[];
    };
  }[];
  construction_permits: { cp_date: string }[];
  acceptance_filings: {
    actual_area: number;
    data_level: string;
    managers: { manager: { name: string } }[];
    companies: { company: { name: string } }[];
    proj_start_date: string;
    af_date: string;
  }[];
};

export function validateProjectData(projectData: ProjectType) {
  // 1. 检查经理是否为同一个人
  const projectManagers = projectData.managers.map((m) => m.manager.name);
  const acceptanceManagers = projectData.acceptance_filings[0].managers.map((m) => m.manager.name);

  const isSameManager = projectManagers[0] === acceptanceManagers[0];
  if (!isSameManager) {
    return { isValid: false, message: '项目经理不一致' };
  }

  // 2. 检查公司是否为同一个公司
  const projectCompanies = projectData.managers[0].manager.certs.map((c) => c.company.name);
  const acceptanceCompanies = projectData.acceptance_filings[0].companies.map((c) => c.company.name);

  const isSameCompany = projectCompanies[0] === acceptanceCompanies[0];
  if (!isSameCompany) {
    return { isValid: false, message: '施工方不一致' };
  }

  // 3. 检查经验时间段
  const projStartDate = projectData?.acceptance_filings?.[0]?.proj_start_date || '';
  const afDate = projectData?.acceptance_filings?.[0]?.af_date || '';
  const cpDate = projectData?.construction_permits?.[0]?.cp_date || '';

  if (!projStartDate) {
    return { isValid: false, message: '无项目开始日期' };
  }
  if (!afDate) {
    return { isValid: false, message: '无项目验收日期' };
  }
  if (!cpDate) {
    return { isValid: false, message: '无施工许可日期' };
  }

  const experiences = projectData.managers[0].manager.certs[0].experiences;
  let hasValidExperience = false;

  for (const exp of experiences) {
    const expStartDate = new Date(exp.start_date);
    const expEndDate = new Date(exp.end_date);
    const projectStartDate = new Date(projStartDate);
    const acceptanceDate = new Date(afDate);

    if (expStartDate <= projectStartDate && expEndDate >= acceptanceDate) {
      hasValidExperience = true;
      break;
    }
  }

  if (!hasValidExperience) {
    return { isValid: false, message: '时间逻辑错误' };
  }

  if (new Date(projStartDate) < new Date(cpDate)) {
    return { isValid: false, message: '项目未批先建' };
  }

  return { isValid: true, message: '验证通过' };
}
