/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */

package org.sonar.server.computation.task.projectanalysis.step;

import org.sonar.server.computation.task.projectanalysis.analysis.AnalysisMetadataHolder;
import org.sonar.server.computation.task.projectanalysis.component.PortfoliosHandler;
import org.sonar.server.computation.task.step.ComputationStep;

/**
 * This step will trigger refreshing of Portfolios and Applications that depends on the project
 * analysed.
 */
public class RefreshPortfoliosStep implements ComputationStep {

  private final PortfoliosHandler portfoliosHandler;
  private final AnalysisMetadataHolder analysisMetadata;

  public RefreshPortfoliosStep(AnalysisMetadataHolder analysisMetadata) {
    this.analysisMetadata = analysisMetadata;
    this.portfoliosHandler = null;
  }

  public RefreshPortfoliosStep(AnalysisMetadataHolder analysisMetadata, PortfoliosHandler portfoliosHandler) {
    this.analysisMetadata = analysisMetadata;
    this.portfoliosHandler = portfoliosHandler;
  }

  @Override
  public void execute() {
    if (portfoliosHandler == null) {
      System.out.println("Governance is not installed");
      return;
    }

    //TODO Govenance is installed
    System.out.println("Governance is installed");

    portfoliosHandler.processProject(analysisMetadata.getProject());
  }

  @Override
  public String getDescription() {
    return "Trigger refresh of Portfolios and Applications";
  }
}
