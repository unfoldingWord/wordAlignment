import React from "react";
import PropTypes from "prop-types";
import Menu from "../Menu";
import MenuFilter from "./MenuFilter";
import MenuHeader from "./MenuHeader";
import memoize from "memoize-one";
import _ from "lodash";

/**
 * Renders filtered menu.
 * This receives the same properties as the {@link Menu} in addition to some filtering options.
 * @param {object[]} filters - an array of filters
 * @param {string} title - the menu title
 *
 */
class FilteredMenu extends React.Component {
  state = {
    filtersOpen: false,
    selectedFilters: [],
    selectedFilterKeys: []
  };

  /**
   * Handles opening the filter menu
   */
  handleOpenFilters = () => {
    this.setState(state => ({ filtersOpen: !state.filtersOpen }));
  };

  /**
   * Handles toggling a filter
   * @param {object} filter - the filter being toggled
   */
  handleToggleFilter = filter => {
    const { selectedFilters, selectedFilterKeys } = this.state;
    const currentIndex = selectedFilterKeys.indexOf(filter.id);
    const newCheckedKeys = [...selectedFilterKeys];
    const newChecked = [...selectedFilters];

    if (currentIndex === -1) {
      newChecked.push(filter);
      newCheckedKeys.push(filter.id);
    } else {
      newChecked.splice(currentIndex, 1);
      newCheckedKeys.splice(currentIndex, 1);
    }

    this.setState({
      selectedFilters: newChecked,
      selectedFilterKeys: newCheckedKeys
    });
  };

  /**
   * Applies default key values to the filters.
   * This prepares filters for use in the filtered menu.
   * @param {[]} filters - an array of filter objects
   * @returns {[]} - an array of normalized filter objects.
   */
  normalizeFilters = memoize(filters => {
    const normalized = [];
    for (let i = 0, len = filters.length; i < len; i++) {
      const filter = Object.assign(
        {},
        { value: true, disables: [], id: filters[i].key },
        filters[i]
      );
      normalized.push(filter);
    }
    return normalized;
  });

  /**
   * Executes all of the enabled filters.
   * Filtering is performed by shallow matching against the filter `value`.
   * Filters are evaluated as "or"
   * @property entries - the menu entries
   * @property {string[]} filters - the filteres that will be applied
   * @returns {[]} - the filtered entries
   */
  filter = memoize((entries, filters) => {
    const groups = _.cloneDeep(entries);
    // filter children
    groups.map(group => {
      group.children = group.children.filter(entry => {
        for (let i = 0, len = filters.length; i < len; i++) {
          if (Boolean(entry[filters[i].key]) === filters[i].value) {
            return true;
          }
        }
        return filters.length === 0;
      });
      return group;
    });

    // filter empty groups
    return groups.filter(entry => entry.children.length > 0);
  });

  render() {
    const {
      filters,
      active,
      entries,
      height,
      title,
      onItemClick,
      width,
      statusIcons,
      emptyNotice
    } = this.props;
    const { selectedFilters, filtersOpen } = this.state;
    const normalizedFilters = this.normalizeFilters(filters);
    const filteredEntries = this.filter(entries, selectedFilters);

    // fallback to filter icons
    const menuStatusIcons = statusIcons !== undefined ? statusIcons : filters;

    return (
      <React.Fragment>
        <Menu
          header={
            filters.length ? (
              <MenuFilter
                onToggle={this.handleToggleFilter}
                onOpen={this.handleOpenFilters}
                open={filtersOpen}
                title={title}
                filters={normalizedFilters}
                selected={selectedFilters}
              />
            ) : (
              <MenuHeader title={title} />
            )
          }
          width={width}
          emptyNotice={emptyNotice}
          statusIcons={menuStatusIcons}
          entries={filteredEntries}
          active={active}
          height={height}
          onItemClick={onItemClick}
        />
      </React.Fragment>
    );
  }
}

FilteredMenu.propTypes = {
  filters: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  entries: PropTypes.arrayOf(PropTypes.object),
  active: PropTypes.object,
  height: PropTypes.any,
  onItemClick: PropTypes.func,
  width: PropTypes.number,
  emptyNotice: PropTypes.string,
  statusIcons: PropTypes.arrayOf(PropTypes.object)
};

FilteredMenu.defaultProps = {
  emptyNotice: "No results found"
};

export default FilteredMenu;
