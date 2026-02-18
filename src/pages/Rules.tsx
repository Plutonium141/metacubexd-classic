import { IconChevronRight, IconReload } from '@tabler/icons-solidjs'
import { createVirtualizer } from '@tanstack/solid-virtual'
import { matchSorter } from 'match-sorter'
import { twMerge } from 'tailwind-merge'
import { Button, DocumentTitle } from '~/components'
import { formatTimeFromNow, useStringBooleanMap } from '~/helpers'
import { useI18n } from '~/i18n'
import { endpoint, gradientThemeColor, useRules } from '~/signals'
import { Rule, RuleProvider } from '~/types'

enum ActiveTab {
  ruleProviders = 'ruleProviders',
  rules = 'rules',
}

export default () => {
  const navigate = useNavigate()

  if (!endpoint()) {
    navigate('/setup', { replace: true })

    return null
  }

  const [t] = useI18n()
  const {
    rules,
    ruleProviders,
    updateRules,
    updateAllRuleProvider,
    updateRuleProviderByName,
  } = useRules()

  onMount(updateRules)

  const { map: updatingMap, setWithCallback: setUpdatingMap } =
    useStringBooleanMap()
  const [allProviderIsUpdating, setAllProviderIsUpdating] = createSignal(false)

  const onUpdateProviderClick = (e: MouseEvent, name: string) => {
    e.stopPropagation()
    void setUpdatingMap(name, () => updateRuleProviderByName(name))
  }

  const onUpdateAllProviderClick = async (e: MouseEvent) => {
    e.stopPropagation()
    setAllProviderIsUpdating(true)
    try {
      await updateAllRuleProvider()
    } catch {
      /* empty */
    }
    setAllProviderIsUpdating(false)
  }

  const [activeTab, setActiveTab] = createSignal(ActiveTab.rules)

  const tabs = () => [
    {
      type: ActiveTab.rules,
      name: t('rules'),
      count: rules().length,
    },
    {
      type: ActiveTab.ruleProviders,
      name: t('ruleProviders'),
      count: ruleProviders().length,
    },
  ]

  const [globalFilter, setGlobalFilter] = createSignal('')

  const filteredRules = createMemo(() =>
    globalFilter()
      ? matchSorter(rules(), globalFilter(), {
          keys: ['type', 'payload', 'proxy'] as (keyof Rule)[],
        })
      : rules(),
  )

  const filteredRuleProviders = createMemo(() =>
    globalFilter()
      ? matchSorter(ruleProviders(), globalFilter(), {
          keys: ['name', 'vehicleType', 'behavior'] as (keyof RuleProvider)[],
        })
      : ruleProviders(),
  )

  let scrollElementRef: HTMLDivElement | undefined

  const getRuleItemKey = ({ type, payload, proxy }: Rule) =>
    `${type}-${payload}-${proxy}`

  const ruleVirtualizer = createVirtualizer({
    get count() {
      return filteredRules().length
    },
    getItemKey: (index) => getRuleItemKey(filteredRules()[index]),
    getScrollElement: () => scrollElementRef!,
    estimateSize: () => 82,
    overscan: 5,
  })

  const ruleVirtualizerItems = ruleVirtualizer.getVirtualItems()

  const getRuleProviderItemKey = ({
    type,
    name,
    vehicleType,
    behavior,
  }: RuleProvider) => `${type}-${name}-${vehicleType}-${behavior}`

  const ruleProviderVirtualizer = createVirtualizer({
    get count() {
      return filteredRuleProviders().length
    },
    getItemKey: (index) =>
      getRuleProviderItemKey(filteredRuleProviders()[index]),
    getScrollElement: () => scrollElementRef!,
    estimateSize: () => 82,
    overscan: 5,
  })

  const ruleProviderVirtualizerItems = ruleProviderVirtualizer.getVirtualItems()

  return (
    <>
      <DocumentTitle>{t('rules')}</DocumentTitle>

      <div class="flex h-full flex-col gap-2">
        <div class="flex w-full flex-wrap items-center gap-2">
          <div class="tabs-box tabs gap-2 tabs-sm">
            <For each={tabs()}>
              {(tab) => (
                <button
                  class={twMerge(
                    activeTab() === tab.type &&
                      (gradientThemeColor()
                        ? 'bg-gradient-to-br from-primary to-secondary !text-neutral'
                        : 'bg-primary !text-neutral'),
                    'sm:tab-md tab gap-2 px-2',
                  )}
                  onClick={() => setActiveTab(tab.type)}
                >
                  <span>{tab.name}</span>
                  <div class="badge badge-sm">{tab.count}</div>
                </button>
              )}
            </For>
          </div>

          <Show when={activeTab() === ActiveTab.ruleProviders}>
            <Button
              class="btn btn-circle btn-sm"
              disabled={allProviderIsUpdating()}
              onClick={(e) => onUpdateAllProviderClick(e)}
              icon={
                <IconReload
                  class={twMerge(
                    allProviderIsUpdating() && 'animate-spin text-success',
                  )}
                />
              }
            />
          </Show>

          <div class="join flex flex-1 items-center justify-end">
            <input
              class="input input-sm join-item flex-1 input-primary md:max-w-100"
              type="search"
              placeholder={t('search')}
              value={globalFilter()}
              onInput={(e) => setGlobalFilter(e.currentTarget.value)}
            />
          </div>
        </div>

        <div
          ref={(ref) => (scrollElementRef = ref)}
          class="flex-1 overflow-y-auto"
        >
          <Show when={activeTab() === ActiveTab.rules}>
            <div
              class="relative"
              style={{ height: `${ruleVirtualizer.getTotalSize()}px` }}
            >
              {ruleVirtualizerItems.map((virtualizerItem) => {
                const rule = filteredRules().find(
                  (rule) => getRuleItemKey(rule) === virtualizerItem.key,
                )!

                return (
                  <div
                    ref={(el) =>
                      onMount(() => ruleVirtualizer.measureElement(el))
                    }
                    data-index={virtualizerItem.index}
                    class="absolute inset-x-0 top-0 pb-2 last:pb-0"
                    style={{
                      transform: `translateY(${virtualizerItem.start}px)`,
                    }}
                  >
                    <div class="card-border card bg-base-200 p-2 card-sm">
                      <div class="flex items-center justify-start gap-4">
                        <div class="flex min-w-8 justify-center">
                          <span>{virtualizerItem.index + 1}</span>
                        </div>
                        <div class="flex flex-col items-start">
                          <div class="flex items-center gap-2">
                            <span class="break-all">{rule.payload}</span>

                            <Show when={rule.size !== -1}>
                              <div class="badge badge-sm">{rule.size}</div>
                            </Show>
                          </div>

                          <div class="text-sm text-slate-500">
                            {`${rule.type}`}
                            <IconChevronRight class="inline-block" size={18} />
                            {`${rule.proxy}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Show>

          <Show when={activeTab() === ActiveTab.ruleProviders}>
            <div
              class="relative"
              style={{ height: `${ruleProviderVirtualizer.getTotalSize()}px` }}
            >
              {ruleProviderVirtualizerItems.map((virtualizerItem) => {
                const ruleProvider = ruleProviders().find(
                  (ruleProvider) =>
                    getRuleProviderItemKey(ruleProvider) ===
                    virtualizerItem.key,
                )!

                return (
                  <div
                    ref={(el) =>
                      onMount(() => ruleProviderVirtualizer.measureElement(el))
                    }
                    data-index={virtualizerItem.index}
                    class="absolute inset-x-0 top-0 pb-2 last:pb-0"
                    style={{
                      transform: `translateY(${virtualizerItem.start}px)`,
                    }}
                  >
                    <div class="card-border card bg-base-200 py-2 ps-4 card-sm">
                      <div class="flex justify-between">
                        <div class="flex items-center justify-start gap-4">
                          <div class="flex min-w-8 justify-center">
                            <span>{virtualizerItem.index + 1}</span>
                          </div>
                          <div class="flex flex-col items-start">
                            <div class="flex items-center gap-2">
                              <span class="break-all">{ruleProvider.name}</span>

                              <div class="badge badge-sm">
                                {ruleProvider.ruleCount}
                              </div>
                            </div>

                            <div class="text-sm text-slate-500">
                              {`${ruleProvider.vehicleType} / ${ruleProvider.behavior} / ${t('updated')} ${formatTimeFromNow(ruleProvider.updatedAt)}`}
                            </div>
                          </div>
                        </div>

                        <div class="items-center align-center flex">
                          <Button
                            class="btn-circle btn-sm mr-4"
                            disabled={updatingMap()[ruleProvider.name]}
                            onClick={(e) =>
                              onUpdateProviderClick(e, ruleProvider.name)
                            }
                            icon={
                              <IconReload
                                class={twMerge(
                                  updatingMap()[ruleProvider.name] &&
                                    'animate-spin text-success',
                                )}
                              />
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Show>
        </div>
      </div>
    </>
  )
}
