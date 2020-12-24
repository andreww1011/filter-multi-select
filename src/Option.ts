/*! 
 *  Multiple select dropdown with filter jQuery plugin.
 *  Copyright (C) 2020  Andrew Wagner  github.com/andreww1011
 *
 *  This library is free software; you can redistribute it and/or
 *  modify it under the terms of the GNU Lesser General Public
 *  License as published by the Free Software Foundation; either
 *  version 2.1 of the License, or (at your option) any later version.
 * 
 *  This library is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 *  Lesser General Public License for more details.
 * 
 *  You should have received a copy of the GNU Lesser General Public
 *  License along with this library; if not, write to the Free Software
 *  Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301
 *  USA
 */
export default interface Option {
    initialize(): void;
    select(): void;
    deselect(): void;
    enable(): void;
    disable(): void;
    isSelected(): boolean;
    isDisabled(): boolean;
    getListItem(): HTMLElement;
    getSelectedItemBadge(): HTMLElement;
    getLabel(): string;
    getValue(): string;
    show(): void;
    hide(): void;
    isHidden(): boolean;
    focus(): void;
}
