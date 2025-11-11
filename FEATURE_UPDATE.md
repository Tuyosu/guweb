# Guweb Profile Enhancements

## 🎉 New Features Added

This update adds two major visual enhancements to the user profile pages:

### 1. **Playcount Graph** 📊
A beautiful interactive chart showing daily play activity over the last 30 days.

**Features:**
- Interactive line chart with hover tooltips
- Displays play counts for each day
- Pink gradient theme matching the site design
- Automatically updates when switching game modes
- Responsive design that works on all screen sizes

**Location:** Below the stats section on the profile page

### 2. **Mod Icons** 🏷️
Colorful gradient badges replacing plain text mod names in score cards.

**Features:**
- Each mod has a unique color scheme with gradient styling
- Hover effects with scaling animation
- Tooltips showing full mod names
- Proper handling of mod conflicts (NC removes DT, PF removes SD)
- Clean, modern design that enhances readability

**Supported Mods:**
- NF (NoFail) - Blue gradient
- EZ (Easy) - Green gradient
- TD (TouchDevice) - Purple gradient
- HD (Hidden) - Orange gradient
- HR (HardRock) - Red gradient
- SD (SuddenDeath) - Dark red gradient
- DT (DoubleTime) - Light blue gradient
- RX (Relax) - Green gradient
- HT (HalfTime) - Orange gradient
- NC (Nightcore) - Pink gradient
- FL (Flashlight) - Dark gradient
- AT (Autoplay) - Teal gradient
- SO (SpunOut) - Purple gradient
- AP (Autopilot) - Light green gradient
- PF (Perfect) - Gold gradient
- Key mods (4K-9K) - Purple gradient
- FI (FadeIn) - Blue gradient
- RD (Random) - Orange gradient
- CN (Cinema) - Cyan gradient
- TP (Target Practice) - Pink gradient

## 📁 Files Modified

### New Files Created:
- `/static/css/mod-icons.css` - Complete mod badge styling system

### Modified Files:
1. **`/templates/profile.html`**
   - Added Chart.js script import
   - Added mod-icons.css stylesheet
   - Added playcount chart container
   - Updated score display to use mod badges (line 33)

2. **`/static/js/pages/profile.js`**
   - Added `playcountChart` to Vue data
   - Added `mounted()` lifecycle hook
   - Added `initPlaycountChart()` method
   - Added `getModIcons()` method
   - Updated `ChangeModeMods()` to refresh chart on mode change

3. **`/static/css/pages/profile.css`**
   - Added playcount chart container styles
   - Added hover effects and transitions

## 🚀 Implementation Details

### Playcount Chart
The chart currently uses **sample data** for demonstration purposes. To connect it to real data from your database:

1. Create an API endpoint that fetches daily playcount statistics:
```python
@frontend.route('/api/v1/get_player_playcount')
async def get_player_playcount():
    user_id = request.args.get('id', type=int)
    mode = request.args.get('mode', type=int)
    
    # Query your database for daily playcount data
    # Return format: [{ date: 'YYYY-MM-DD', count: N }, ...]
    
    return jsonify({
        'playcounts': playcount_data
    })
```

2. Update the `initPlaycountChart()` method in `profile.js` to fetch real data:
```javascript
// Replace the sample data generation with:
this.$axios.get(`${window.location.protocol}//api.${domain}/v1/get_player_playcount`, {
    params: {
        id: this.userid,
        mode: this.StrtoGulagInt()
    }
})
.then(res => {
    const labels = res.data.playcounts.map(d => d.date);
    const data = res.data.playcounts.map(d => d.count);
    // ... rest of chart initialization
});
```

### Mod Icons
The mod icons are **fully functional** and will display immediately for any scores that have mods enabled. No database changes are required.

## 🎨 Customization

### Changing Chart Colors
Edit the chart configuration in `initPlaycountChart()`:
```javascript
borderColor: 'rgba(255, 179, 217, 0.8)', // Line color
backgroundColor: 'rgba(255, 179, 217, 0.2)', // Fill color
```

### Adding New Mods
To add support for new mods:
1. Add the mod definition in `getModIcons()` method in `profile.js`
2. Create corresponding CSS class in `mod-icons.css`
3. Test the display in score cards

## 📦 Dependencies

- **Chart.js v3.9.1** - For the playcount graph (loaded from CDN)
- **Vue.js** - Already part of the project
- **Axios** - Already part of the project

## 🐛 Troubleshooting

**Chart not displaying:**
1. Check browser console for JavaScript errors
2. Verify Chart.js is loading from CDN
3. Ensure the canvas element has a valid ID
4. Clear browser cache

**Mod icons not showing:**
1. Verify `mod-icons.css` is loaded
2. Check that `getModIcons()` is being called in the template
3. Inspect the HTML to see if mod badges are rendered
4. Clear browser cache

**Styles not updating:**
1. Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
2. Check if CSS files are being served correctly
3. Verify there are no CSS conflicts

## 💡 Future Enhancements

Potential improvements for future updates:

1. **Chart Enhancements:**
   - Add date range selector (7 days, 30 days, 90 days, 1 year)
   - Show additional metrics (accuracy trend, pp gain, rank changes)
   - Add comparison view (current vs previous period)
   - Export chart as image

2. **Mod Icons:**
   - Add mod combination badges (HDHR, HDDT, etc.)
   - Show mod difficulty multiplier on hover
   - Animated mod icons
   - Custom mod icon themes

3. **Performance:**
   - Implement chart data caching
   - Lazy load chart library
   - Optimize API calls

## 📄 License

These modifications maintain the same license as the original guweb project.

## 🤝 Support

For issues or questions about these features:
1. Check the troubleshooting section above
2. Verify all files are properly installed
3. Check browser console for errors
4. Review the API endpoint implementation

---

**Version:** 1.0.0  
**Last Updated:** November 2025  
**Compatible with:** guweb (gulag-web)
