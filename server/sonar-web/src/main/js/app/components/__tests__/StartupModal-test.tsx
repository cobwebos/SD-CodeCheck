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
import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { StartupModal } from '../StartupModal';
import { showLicense } from '../../../api/marketplace';
import { save, get } from '../../../helpers/storage';
import { hasMessage } from '../../../helpers/l10n';
import { waitAndUpdate } from '../../../helpers/testUtils';
import { differenceInDays, toShortNotSoISOString } from '../../../helpers/dates';
import { LoggedInUser } from '../../types';
import { EditionKey } from '../../../apps/marketplace/utils';

jest.mock('../../../api/marketplace', () => ({
  showLicense: jest.fn().mockResolvedValue(undefined)
}));

jest.mock('../../../helpers/storage', () => ({
  get: jest.fn(),
  save: jest.fn()
}));

jest.mock('../../../helpers/l10n', () => ({
  hasMessage: jest.fn().mockReturnValue(true)
}));

jest.mock('../../../helpers/dates', () => ({
  differenceInDays: jest.fn().mockReturnValue(1),
  parseDate: jest.fn().mockReturnValue('parsed-date'),
  toShortNotSoISOString: jest.fn().mockReturnValue('short-not-iso-date')
}));

const LOGGED_IN_USER: LoggedInUser = {
  isLoggedIn: true,
  login: 'luke',
  name: 'Skywalker',
  showOnboardingTutorial: false
};

beforeEach(() => {
  (differenceInDays as jest.Mock<any>).mockClear();
  (hasMessage as jest.Mock<any>).mockClear();
  (get as jest.Mock<any>).mockClear();
  (save as jest.Mock<any>).mockClear();
  (showLicense as jest.Mock<any>).mockClear();
  (toShortNotSoISOString as jest.Mock<any>).mockClear();
});

it('should render only the children', async () => {
  const wrapper = getWrapper({ currentEdition: EditionKey.community });
  await shouldNotHaveModals(wrapper);
  expect(showLicense).toHaveBeenCalledTimes(0);
  expect(wrapper.find('div').exists()).toBeTruthy();

  await shouldNotHaveModals(getWrapper({ canAdmin: false }));

  (hasMessage as jest.Mock<any>).mockReturnValueOnce(false);
  await shouldNotHaveModals(getWrapper());

  (showLicense as jest.Mock<any>).mockResolvedValueOnce({ isValidEdition: true });
  await shouldNotHaveModals(getWrapper());

  (get as jest.Mock<any>).mockReturnValueOnce('date');
  (differenceInDays as jest.Mock<any>).mockReturnValueOnce(0);
  await shouldNotHaveModals(getWrapper());

  await shouldNotHaveModals(
    getWrapper({
      canAdmin: false,
      currentUser: { ...LOGGED_IN_USER, showOnboardingTutorial: true },
      location: { pathname: 'documentation/index' }
    })
  );
});

it('should render license prompt', async () => {
  await shouldDisplayLicense(getWrapper());
  expect(save).toHaveBeenCalledWith('sonarqube.license.prompt', 'short-not-iso-date', 'luke');

  (get as jest.Mock<any>).mockReturnValueOnce('date');
  (differenceInDays as jest.Mock<any>).mockReturnValueOnce(1);
  await shouldDisplayLicense(getWrapper());

  (showLicense as jest.Mock<any>).mockResolvedValueOnce({ isValidEdition: false });
  await shouldDisplayLicense(getWrapper());
});

it('should render onboarding modal', async () => {
  await shouldDisplayOnboarding(
    getWrapper({
      canAdmin: false,
      currentUser: { ...LOGGED_IN_USER, showOnboardingTutorial: true }
    })
  );

  (showLicense as jest.Mock<any>).mockResolvedValueOnce({ isValidEdition: true });
  await shouldDisplayOnboarding(
    getWrapper({ currentUser: { ...LOGGED_IN_USER, showOnboardingTutorial: true } })
  );
});

async function shouldNotHaveModals(wrapper: ShallowWrapper) {
  await waitAndUpdate(wrapper);
  expect(wrapper.find('LicensePromptModal').exists()).toBeFalsy();
  expect(wrapper.find('OnboardingModal').exists()).toBeFalsy();
}

async function shouldDisplayOnboarding(wrapper: ShallowWrapper) {
  await waitAndUpdate(wrapper);
  expect(wrapper.find('OnboardingModal').exists()).toBeTruthy();
}

async function shouldDisplayLicense(wrapper: ShallowWrapper) {
  await waitAndUpdate(wrapper);
  expect(wrapper.find('LicensePromptModal').exists()).toBeTruthy();
}

function getWrapper(props = {}) {
  return shallow(
    <StartupModal
      canAdmin={true}
      currentEdition={EditionKey.enterprise}
      currentUser={LOGGED_IN_USER}
      location={{ pathname: 'foo/bar' }}
      skipOnboarding={jest.fn()}
      {...props}>
      <div />
    </StartupModal>
  );
}
